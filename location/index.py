from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from services.placesService import get_place_predictions, get_place_details, geocode_address, reverse_geocode

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/location/*": {"origins": "http://localhost:8080"}})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "UP"})

@app.route('/api/places/autocomplete', methods=['GET'])
def autocomplete():
    input_text = request.args.get('input', '')
    if not input_text:
        return jsonify({"error": "Input parameter is required", "predictions": []}), 400
    
    results = get_place_predictions(input_text)
    return jsonify(results)

@app.route('/api/places/details', methods=['GET'])
def place_details():
    place_id = request.args.get('place_id', '')
    if not place_id:
        return jsonify({"error": "place_id parameter is required"}), 400
    
    results = get_place_details(place_id)
    return jsonify(results)

@app.route('/api/geocode', methods=['GET'])
def geocode():
    address = request.args.get('address', '')
    if not address:
        return jsonify({"error": "address parameter is required"}), 400
    
    results = geocode_address(address)
    return jsonify(results)

@app.route('/api/reverse-geocode', methods=['GET'])
def reverse_geocode_endpoint():
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    
    if not lat or not lng:
        return jsonify({"error": "lat and lng parameters are required"}), 400
    
    try:
        lat = float(lat)
        lng = float(lng)
    except ValueError:
        return jsonify({"error": "lat and lng must be valid numbers"}), 400
    
    results = reverse_geocode(lat, lng)
    return jsonify(results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=3005)
