import os
import requests
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')
PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place'

def get_place_predictions(input_text):
    """Get place predictions using the legacy Places API"""
    url = f"{PLACES_API_BASE_URL}/autocomplete/json"
    
    params = {
        'input': input_text,
        'key': API_KEY,
        'components': 'country:sg',
        'location': '1.3521,103.8198',
        'radius': 50000
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return {
            'predictions': response.json().get('predictions', [])
        }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching place predictions: {e}")
        return {"error": str(e), "predictions": []}

def get_place_details(place_id):
    """Get place details using the legacy Places API"""
    url = f"{PLACES_API_BASE_URL}/details/json"
    
    params = {
        'place_id': place_id,
        'key': API_KEY,
        'fields': 'formatted_address,geometry,name'
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching place details: {e}")
        return {"error": str(e)}

def geocode_address(address):
    """Geocode an address to coordinates"""
    url = f"https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        'address': address,
        'key': API_KEY,
        'region': 'sg'
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error geocoding address: {e}")
        return {"error": str(e)}

def reverse_geocode(lat, lng):
    """Reverse geocode coordinates to address"""
    url = f"https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        'latlng': f"{lat},{lng}",
        'key': API_KEY
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error reverse geocoding: {e}")
        return {"error": str(e)}
