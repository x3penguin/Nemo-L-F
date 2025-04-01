from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from flask_cors import CORS
import requests
import json
from firebase_client import db, save_selected_order
from firebase_admin import firestore

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
EASYPARCEL_API_KEY = os.getenv("EASYPARCEL_API_KEY")
CORS(app)  # Add CORS support to the Flask app


# rate check api from easy parcel modified to only return the lowest 10 rates
@app.route("/rate-check", methods=["POST"])
def rate_check():
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
                            filtered_rates.append(
                                {
                                    "service_name": rate.get("service_name", ""),
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
    app.run(debug=True, port=3010)
