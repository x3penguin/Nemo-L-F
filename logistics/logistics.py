from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from flask_cors import CORS
import requests
import json

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
EASYPARCEL_API_KEY = os.getenv('EASYPARCEL_API_KEY')
CORS(app)  # Add CORS support to the Flask app

@app.route('/rate-check', methods=['POST'])
def rate_check():
    domain = "https://demo.connect.easyparcel.sg/?ac="
    action = "EPRateCheckingBulk"
    
    # Get data from request or use default values
    request_data = request.get_json() or {}
    
 # Create a single shipment object
    shipment = {
        'pick_code': request_data.get('pick_code', '059893'), 
        'pick_country': request_data.get('pick_country', 'SG'),
        'send_code': request_data.get('send_code', '059897'),
        'send_country': request_data.get('send_country', 'SG'),
        'weight': request_data.get('weight', '10')
        # 'width': request_data.get('width', '0'),
        # 'length': request_data.get('length', '0'),
        # 'height': request_data.get('height', '0'),
        # 'date_coll': request_data.get('date_coll', '2017-11-10'),
    }
    
    # Manually construct form data in the format EasyParcel expects
    form_data = {
        'api': EASYPARCEL_API_KEY,
        'bulk[0][pick_code]': shipment['pick_code'],
        'bulk[0][pick_country]': shipment['pick_country'],
        'bulk[0][send_code]': shipment['send_code'],
        'bulk[0][send_country]': shipment['send_country'],
        'bulk[0][weight]': shipment['weight']
        # 'bulk[0][width]': shipment['width'],
        # 'bulk[0][length]': shipment['length'],
        # 'bulk[0][height]': shipment['height'],
        # 'bulk[0][date_coll]': shipment['date_coll']
    }
    
    url = domain + action
    
    try:
        # Make the API request with form-encoded data
        response = requests.post(url, data=form_data)
        
        # For debugging
        print("Sent data:", form_data)
        print("Response:", response.text)
        
        # Check if the request was successful
        if response.status_code == 200:
            return jsonify(json.loads(response.text))
        else:
            return jsonify({
                'status': 'error',
                'message': f'API request failed with status code {response.status_code}',
                'response': response.text
            }), 500
    
    except Exception as e:
        print(f"Exception: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    
# @app.route('/submit-order', methods=['POST'])
# def submit_order():
#     domain = "https://demo.connect.easyparcel.sg/?ac="
#     action = "EPSubmitOrderBulk"
    
#     # Get data from request
#     request_data = request.get_json() or {}
    
#     # Validate required fields
#     required_fields = [
#         'weight', 'content', 'value', 'service_id', 
#         'pick_name', 'pick_contact', 'pick_unit', 'pick_code', 'pick_country',
#         'send_name', 'send_contact', 'send_unit', 'send_addr1', 'send_state', 
#         'send_code', 'send_country', 'collect_date'
#     ]
    
#     missing_fields = [field for field in required_fields if field not in request_data]
#     if missing_fields:
#         return jsonify({
#             'status': 'error',
#             'message': f'Missing required fields: {", ".join(missing_fields)}'
#         }), 400
    
#     # Construct the form data for EasyParcel API
#     form_data = {
#         'api': EASYPARCEL_API_KEY,
#         'bulk[0][weight]': request_data.get('weight'),
#         # 'bulk[0][width]': request_data.get('width', '0'),
#         # 'bulk[0][length]': request_data.get('length', '0'),
#         # 'bulk[0][height]': request_data.get('height', '0'),
#         'bulk[0][content]': request_data.get('content'),
#         'bulk[0][value]': request_data.get('value'),
#         'bulk[0][service_id]': request_data.get('service_id'),
#         'bulk[0][pick_name]': request_data.get('pick_name'),
#         # 'bulk[0][pick_company]': request_data.get('pick_company', ''),
#         # 'bulk[0][pick_mobile]': request_data.get('pick_mobile', ''),
#         'bulk[0][pick_contact]': request_data.get('pick_contact'),
#         'bulk[0][pick_unit]': request_data.get('pick_unit'),
#         'bulk[0][pick_code]': request_data.get('pick_code'),
#         'bulk[0][pick_country]': request_data.get('pick_country'),
#         'bulk[0][send_name]': request_data.get('send_name'),
#         # 'bulk[0][send_company]': request_data.get('send_company', ''),
#         # 'bulk[0][send_mobile]': request_data.get('send_mobile', ''),
#         'bulk[0][send_contact]': request_data.get('send_contact'),
#         'bulk[0][send_unit]': request_data.get('send_unit'),
#         'bulk[0][send_addr1]': request_data.get('send_addr1'),
#         'bulk[0][send_state]': request_data.get('send_state'),
#         'bulk[0][send_code]': request_data.get('send_code'),
#         'bulk[0][send_country]': request_data.get('send_country'),
#         'bulk[0][collect_date]': request_data.get('collect_date'),
#         # 'bulk[0][reference]': request_data.get('reference', ''),
#         # 'bulk[0][sms]': request_data.get('sms', 'false')
#     }
    
#     # # Add optional WhatsApp tracking if provided
#     # if 'addon_whatsapp_tracking_enabled' in request_data:
#     #     form_data['bulk[0][addon_whatsapp_tracking_enabled]'] = request_data.get('addon_whatsapp_tracking_enabled')
    
#     url = domain + action
    
#     try:
#         # Make the API request
#         response = requests.post(url, data=form_data)
        
#         # For debugging
#         print("Submit Order - Sent data:", form_data)
#         print("Submit Order - Response:", response.text)
        
#         # Check if the request was successful
#         if response.status_code == 200:
#             return jsonify(json.loads(response.text))
#         else:
#             return jsonify({
#                 'status': 'error',
#                 'message': f'API request failed with status code {response.status_code}',
#                 'response': response.text
#             }), 500
    
#     except Exception as e:
#         print(f"Exception: {str(e)}")
#         return jsonify({
#             'status': 'error',
#             'message': str(e)
#         }), 500
    
# @app.route('/order-status', methods=['POST'])
# def order_status():
#     domain = "https://demo.connect.easyparcel.sg/?ac="
#     action = "EPOrderStatusBulk"
    
#     # Get data from request
#     request_data = request.get_json() or {}
    
#     # Validate required fields
#     if 'order_no' not in request_data:
#         return jsonify({
#             'status': 'error',
#             'message': 'Missing required field: order_no'
#         }), 400
#     # Create a bulk array from the provided order numbers
#     # If a single order_no is provided as a string, convert it to a list
#     order_numbers = request_data['order_no']
#     if isinstance(order_numbers, str):
#         order_numbers = [order_numbers]
    
#     # Construct the form data for EasyParcel API
#     form_data = {
#         'api': EASYPARCEL_API_KEY
#     }
    
#     # Add each order number to the bulk array
#     for i, order_no in enumerate(order_numbers):
#         form_data[f'bulk[{i}][order_no]'] = order_no
    
#     url = domain + action
    
#     try:
#         # Make the API request
#         response = requests.post(url, data=form_data)
        
#         # For debugging
#         print("Order Status - Sent data:", form_data)
#         print("Order Status - Response:", response.text)
        
#         # Check if the request was successful
#         if response.status_code == 200:
#             return jsonify(json.loads(response.text))
#         else:
#             return jsonify({
#                 'status': 'error',
#                 'message': f'API request failed with status code {response.status_code}',
#                 'response': response.text
#             }), 500
    
#     except Exception as e:
#         print(f"Exception: {str(e)}")
#         return jsonify({
#             'status': 'error',
#             'message': str(e)
#         }), 500

if __name__ == '__main__':
    app.run(debug=True, port=3010)
