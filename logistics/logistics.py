from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import requests
import json

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
EASYPARCEL_API_KEY = os.getenv('EASYPARCEL_API_KEY')

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
        'weight': request_data.get('weight', '10'),
        'width': request_data.get('width', '0'),
        'length': request_data.get('length', '0'),
        'height': request_data.get('height', '0'),
        'date_coll': request_data.get('date_coll', '2017-11-10'),
    }
    
    # Manually construct form data in the format EasyParcel expects
    form_data = {
        'api': EASYPARCEL_API_KEY,
        'bulk[0][pick_code]': shipment['pick_code'],
        'bulk[0][pick_country]': shipment['pick_country'],
        'bulk[0][send_code]': shipment['send_code'],
        'bulk[0][send_country]': shipment['send_country'],
        'bulk[0][weight]': shipment['weight'],
        'bulk[0][width]': shipment['width'],
        'bulk[0][length]': shipment['length'],
        'bulk[0][height]': shipment['height'],
        'bulk[0][date_coll]': shipment['date_coll']
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

if __name__ == '__main__':
    app.run(debug=True, port=5003)
