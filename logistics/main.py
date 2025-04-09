from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from flask_cors import CORS
import requests
import json
import html
from firebase_client import db, save_selected_order
from firebase_admin import firestore
from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin
from apispec_webframeworks.flask import FlaskPlugin
import yaml

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
EASYPARCEL_API_KEY = os.getenv("EASYPARCEL_API_KEY")

CORS(app, resources={r"/logistics/*": {"origins": "http://localhost:8080"}})

spec = APISpec(
    title="Logistics Service API",
    version="1.0.0",
    openapi_version="3.0.3",
    plugins=[FlaskPlugin(), MarshmallowPlugin()],
)

@app.route('/swagger.json')
def swagger_spec():
    """
    Generate Swagger specification.
    ---
    get:
      summary: Generate Swagger specification
      responses:
        200:
          description: Swagger JSON generated successfully
    """
    with app.test_request_context():
        for rule in app.url_map.iter_rules():
            if rule.endpoint != 'static' and not rule.rule.startswith('/api-docs'):
                view_func = app.view_functions[rule.endpoint]
                # Parse the YAML docstring manually
                docstring = view_func.__doc__
                if docstring:
                    try:
                        operations = {
                            "get": yaml.safe_load(docstring.split('---', 1)[1])
                        }
                        spec.path(view=view_func, operations=operations)
                    except Exception as e:
                        print(f"Error parsing docstring for {rule.endpoint}: {e}")
    return jsonify(spec.to_dict())

# rate check api from easy parcel modified to only return the lowest 10 rates
@app.route("/rate-check", methods=["POST"])
def rate_check():
    """
    Perform rate check and return the lowest 10 rates.
    ---
    post:
      summary: Perform rate check
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                pick_code:
                  type: string
                pick_country:
                  type: string
                send_code:
                  type: string
                send_country:
                  type: string
                weight:
                  type: string
      responses:
        200:
          description: Successfully retrieved rates
        500:
          description: Internal server error
    """
    domain = "https://demo.connect.easyparcel.sg/?ac="
    action = "EPRateCheckingBulk"

    request_data = request.get_json() or {}
    shipment = {
        "pick_code": request_data.get("pick_code", "059893"),
        "pick_country": request_data.get("pick_country", "SG"),
        "send_code": request_data.get("send_code", "059897"),
        "send_country": request_data.get("send_country", "SG"),
        "weight": request_data.get("weight", "10"),
    }

    form_data = {
        "api": os.getenv("EASYPARCEL_API_KEY"),
        "bulk[0][pick_code]": shipment["pick_code"],
        "bulk[0][pick_country]": shipment["pick_country"],
        "bulk[0][send_code]": shipment["send_code"],
        "bulk[0][send_country]": shipment["send_country"],
        "bulk[0][weight]": shipment["weight"],
    }

    url = domain + action

    try:
        response = requests.post(url, data=form_data)
        if response.status_code == 200:
            rate_data = json.loads(response.text)
            filtered_rates = []
            if "result" in rate_data:
                for result in rate_data["result"]:
                    for rate in result.get("rates", []):
                        price = float(rate.get("price", 0))
                        if price > 0:
                            service_name = html.unescape(rate.get("service_name", ""))
                            filtered_rates.append(
                                {
                                    "service_name": service_name,
                                    "price": price,
                                    # Add any additional fields you need from the rate
                                }
                            )
            # Sort ascending and limit to 10
            sorted_rates = sorted(filtered_rates, key=lambda x: x["price"])[:10]
            return jsonify({"rates": sorted_rates})
        else:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": f"API request failed with status code {response.status_code}",
                        "response": response.text,
                    }
                ),
                500,
            )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# update firestore with the selected order
@app.route("/select-order", methods=["POST"])
def select_order():
    """
    Save the selected order to Firestore.
    ---
    post:
      summary: Save selected order
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                order:
                  type: object
      responses:
        200:
          description: Order saved successfully
        400:
          description: Order details not provided
    """
    data = request.get_json()
    order = data.get("order")
    if not order:
        return (
            jsonify({"status": "error", "message": "Order details not provided"}),
            400,
        )

    order_id = save_selected_order(order)
    return jsonify({"status": "success", "order_id": order_id})


@app.route("/api/orders/item/<item_id>", methods=["GET"])
def get_order_by_item_id(item_id):
    """
    Retrieve order details by item ID.
    ---
    get:
      summary: Get order by item ID
      parameters:
        - in: path
          name: item_id
          required: true
          schema:
            type: string
      responses:
        200:
          description: Order retrieved successfully
        404:
          description: Order not found
        500:
          description: Internal server error
    """
    try:
        # Query Firestore for the order
        order_ref = db.collection("selected_orders")
        query = order_ref.where("order_data.item_id", "==", item_id)
        orders = query.get()

        if not orders:
            return jsonify({"success": False, "error": "Order not found"}), 404

        # Get the first matching order
        order_data = orders[0].to_dict()

        return jsonify({"success": True, "order_data": order_data["order_data"]})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/orders/status", methods=["PUT", "OPTIONS"])
def update_order_status():
    """
    Update the delivery status of an order.
    ---
    put:
      summary: Update order status
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                item_id:
                  type: string
                delivery_status:
                  type: string
      responses:
        200:
          description: Order status updated successfully
        400:
          description: Missing required fields
        404:
          description: Order not found
        500:
          description: Internal server error
    """
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        return "", 200

    data = request.json

    if not data or "item_id" not in data or "delivery_status" not in data:
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    try:
        item_id = data["item_id"]
        new_status = data["delivery_status"]

        # Query Firestore for the order
        order_ref = db.collection("selected_orders")
        orders = order_ref.where("order_data.item_id", "==", item_id).get()

        if not orders:
            return jsonify({"success": False, "error": "Order not found"}), 404

        # Update the first matching order
        order_doc = orders[0]
        order_doc.reference.update({"order_data.delivery_status": new_status})

        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=3010)