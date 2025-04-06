from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from services.placesService import get_place_predictions, get_place_details, geocode_address, reverse_geocode
from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin
from apispec_webframeworks.flask import FlaskPlugin
import yaml

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/location/*": {"origins": "http://localhost:8080"},})

spec = APISpec(
    title="Location Service API",
    version="1.0.0",
    openapi_version="3.0.3",
    plugins=[FlaskPlugin(), MarshmallowPlugin()],
)

@app.route('/swagger.json')
def swagger_spec():
    """
    Generate Swagger specification.
    ---
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

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    ---
    responses:
      200:
        description: Service is up and running
    """
    return jsonify({"status": "UP"})

@app.route('/api/places/autocomplete', methods=['GET'])
def autocomplete():
    """
    Get place predictions based on input text.
    ---
    parameters:
      - name: input
        in: query
        type: string
        required: true
        description: Input text for place predictions
    responses:
      200:
        description: List of place predictions
      400:
        description: Input parameter is required
    """
    input_text = request.args.get('input', '')
    if not input_text:
        return jsonify({"error": "Input parameter is required", "predictions": []}), 400
    
    results = get_place_predictions(input_text)
    return jsonify(results)

@app.route('/api/places/details', methods=['GET'])
def place_details():
    """
    Get details of a place by place_id.
    ---
    parameters:
      - name: place_id
        in: query
        type: string
        required: true
        description: Unique identifier for the place
    responses:
      200:
        description: Place details
      400:
        description: place_id parameter is required
    """
    place_id = request.args.get('place_id', '')
    if not place_id:
        return jsonify({"error": "place_id parameter is required"}), 400
    
    results = get_place_details(place_id)
    return jsonify(results)

@app.route('/api/geocode', methods=['GET'])
def geocode():
    """
    Geocode an address to get latitude and longitude.
    ---
    parameters:
      - name: address
        in: query
        type: string
        required: true
        description: Address to geocode
    responses:
      200:
        description: Geocoded address details
      400:
        description: address parameter is required
    """
    address = request.args.get('address', '')
    if not address:
        return jsonify({"error": "address parameter is required"}), 400
    
    results = geocode_address(address)
    return jsonify(results)

@app.route('/api/reverse-geocode', methods=['GET'])
def reverse_geocode_endpoint():
    """
    Reverse geocode latitude and longitude to get an address.
    ---
    parameters:
      - name: lat
        in: query
        type: number
        required: true
        description: Latitude coordinate
      - name: lng
        in: query
        type: number
        required: true
        description: Longitude coordinate
    responses:
      200:
        description: Reverse geocoded address details
      400:
        description: lat and lng parameters are required or invalid
    """
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
