from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from flask_cors import CORS
import requests
import json
from firebase_config import db
from firebase_admin import firestore

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
EASYPARCEL_API_KEY = os.getenv('EASYPARCEL_API_KEY')
CORS(app)  # Add CORS support to the Flask app

# rate check api from easy parcel
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
        response = requests.post(url, data=form_data)
        
        print("Sent data:", form_data)
        print("Response:", response.text)
        
        if response.status_code == 200:
            rate_data = json.loads(response.text)
            
            # Save shipping rate data to Firestore
            doc_ref = db.collection('shipping_rates').document()
            doc_ref.set({
                'timestamp': firestore.SERVER_TIMESTAMP,
                'rate_data': rate_data,
                'shipment': shipment
            })
            
            return jsonify(rate_data)
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
    
@app.route('/shipping-history', methods=['GET'])
def shipping_history():
    """Get recent shipping rate checks from Firebase, sorted by lowest non-zero price"""
    limit = request.args.get('limit', 10, type=int)
    
    # Query Firestore for all shipping rates
    rates_ref = db.collection('shipping_rates').order_by('timestamp', direction=firestore.Query.DESCENDING)
    
    all_rates = []
    for doc in rates_ref.stream():
        rate_data = doc.to_dict()
        if 'rate_data' in rate_data and 'result' in rate_data['rate_data']:
            for result in rate_data['rate_data']['result']:
                for rate in result.get('rates', []):
                    if rate.get('price', 0) > 0:
                        all_rates.append({
                            'timestamp': rate_data['timestamp'],
                            'shipment': rate_data.get('shipment', {}),
                            'service_name': rate.get('service_name', ''),
                            'price': rate.get('price', 0)
                        })
    
    # Sort rates by price (low to high) and limit to 10
    sorted_rates = sorted(all_rates, key=lambda x: x['price'])[:limit]
    
    return jsonify({
        'status': 'success',
        'data': sorted_rates
    })

if __name__ == '__main__':
    app.run(debug=True, port=3010)
