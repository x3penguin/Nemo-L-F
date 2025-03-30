import math
from firebase_client import get_item_by_id


def compare_locations(location1, location2):
    """Calculate the distance between two locations using Haversine formula."""
    lat1, lon1 = location1
    lat2, lon2 = location2

    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    # Radius of Earth in kilometers
    radius = 6371
    distance = radius * c

    # Convert distance to confidence score (0-100)
    # Closer locations have higher confidence
    # 0km = 100% confidence, 10km = 0% confidence
    confidence = max(0, 100 - (distance * 10))

    return {"distance": distance, "confidence": confidence}


def match_locations(best_image_matches, coordinates):
    """Find the best location match from best_image_matches results."""
    try:
        print(f"Starting location matching with coordinates: {coordinates}")
        best_location_matches = []

        for best_image_match in best_image_matches:
            image_matched_item = get_item_by_id(best_image_match["id"])
            if (
                "latitude" not in image_matched_item
                or not image_matched_item["latitude"]
            ):
                continue

            try:
                item_lat = float(image_matched_item["latitude"])
                item_lon = float(image_matched_item["longitude"])
                found_lat, found_lon = map(float, coordinates)

                result = compare_locations((found_lat, found_lon), (item_lat, item_lon))
                confidence = result["confidence"]
                distance = result["distance"]

                print(
                    f"Location match: Item ID {image_matched_item['id']} - Distance: {distance:.2f}km, Location confidence: {confidence:.2f}%"
                )

                if confidence > 80:
                    image_confidence = float(best_image_match["image_confidence"])
                    weighted_confidence = (0.7 * image_confidence) + (0.3 * confidence)
                    print(
                        f"Added to matches - Image confidence: {image_confidence:.2f}%, Weighted confidence: {weighted_confidence:.2f}%"
                    )
                    best_location_matches.append(
                        {
                            "id": image_matched_item["id"],
                            "image_confidence": image_confidence,
                            "location_confidence": confidence,
                            "distance": distance,
                        }
                    )

            except Exception as e:
                print(f"Error comparing with item {image_matched_item.get('id')}: {e}")

        if best_location_matches:
            print(
                f"Found {len(best_location_matches)} location matches above threshold"
            )
            return best_location_matches

        print("No location matches found above threshold")
        return None

    except Exception as e:
        print(f"Error in match_locations: {e}")
        return None
