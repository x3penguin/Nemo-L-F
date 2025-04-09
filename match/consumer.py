# matching/consumer.py
from kafka import KafkaConsumer
import json
import os
from image_match.image_matcher import match_images, match_lost_item
from location_match.location_matcher import match_locations
from firebase_client import get_owner_details, store_potential_matches
import requests
import datetime


def start_consumer():
    # Get configuration from environment variables or use defaults
    kafka_brokers = os.environ.get("KAFKA_BROKERS")
    kafka_topic = os.environ.get("KAFKA_TOPIC")
    kafka_group = os.environ.get("KAFKA_GROUP_ID")

    print(f"Connecting to Kafka brokers: {kafka_brokers}")
    print(f"Listening on topic: {kafka_topic}")

    consumer = KafkaConsumer(
        kafka_topic,
        bootstrap_servers=kafka_brokers,
        auto_offset_reset="earliest",
        enable_auto_commit=False,
        group_id=kafka_group,
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    )

    print("Kafka consumer started, waiting for matching jobs...")

    for message in consumer:
        try:
            # Process the matching job
            data = message.value

            # Extract fields based on your team's message format
            item_id = data.get("itemId")
            image_url = data.get("imageUrl")
            coordinates = data.get("coordinates")

            if not item_id or not image_url:
                print(f"Missing required fields in message: {data}")
                consumer.commit()
                continue

            print(f"Processing image matching for item {item_id}")

            # Get item to determine if it's lost or found
            from firebase_client import get_item_by_id

            item = get_item_by_id(item_id)
            if not item:
                print(f"Item {item_id} not found")
                consumer.commit()
                continue

            # Run image matching algorithm based on item status
            best_image_matches = None
            if item.get("status") == "FOUND":
                # Match found item against lost items
                best_image_matches = match_images(item_id, image_url)
            elif item.get("status") == "LOST":
                # Match lost item against found items
                best_image_matches = match_lost_item(item_id, image_url)
            else:
                print(f"Item {item_id} has invalid status: {item.get('status')}")
                consumer.commit()
                continue

            if best_image_matches:
                print(f"Found {len(best_image_matches)} potential image matches")
                # Convert coordinates from array to tuple
                coordinates_tuple = (
                    tuple(coordinates)
                    if coordinates and len(coordinates) == 2
                    else None
                )

                if coordinates_tuple:
                    best_location_matches = match_locations(
                        best_image_matches, coordinates
                    )

                    if best_location_matches:
                        print(
                            f"Found {len(best_location_matches)} potential location matches"
                        )
                        final_matches = []
                        for match in best_location_matches:
                            image_confidence = float(match["image_confidence"])
                            location_confidence = match["location_confidence"]
                            weighted_confidence = (0.7 * image_confidence) + (
                                0.3 * location_confidence
                            )
                            if weighted_confidence > 80:
                                # For lost items, swap the IDs to keep consistent format
                                if item.get("status") == "LOST":
                                    final_matches.append(
                                        {
                                            "lostItemId": item_id,  # This is the lost item
                                            "foundItemId": match[
                                                "id"
                                            ],  # This is the found item
                                            "imageConfidence": image_confidence,
                                            "locationConfidence": location_confidence,
                                            "weightedConfidence": weighted_confidence,
                                            "distance": match["distance"],
                                            "timestamp": datetime.datetime.now().isoformat(),
                                        }
                                    )
                                else:
                                    final_matches.append(
                                        {
                                            "lostItemId": match["id"],
                                            "foundItemId": item_id,
                                            "imageConfidence": image_confidence,
                                            "locationConfidence": location_confidence,
                                            "weightedConfidence": weighted_confidence,
                                            "distance": match["distance"],
                                            "timestamp": datetime.datetime.now().isoformat(),
                                        }
                                    )

                        if final_matches:
                            print(
                                f"Final matches after weighting: {len(final_matches)}"
                            )
                            # Sort by weighted confidence (highest first)
                            final_matches.sort(
                                key=lambda x: x["weightedConfidence"], reverse=True
                            )

                            # Get top 5 matches (or all if less than 5)
                            top_matches = final_matches[:5]

                            # Store all potential matches for display in UI
                            for match in top_matches:
                                # For both lost and found items, send email to the owner of the lost item
                                lost_item_id = match["lostItemId"]
                                found_item_id = match["foundItemId"]

                                lost_item = get_item_by_id(lost_item_id)
                                if lost_item and lost_item.get("ownerId"):
                                    owner_details = get_owner_details(lost_item_id)
                                    if owner_details and "email" in owner_details:
                                        # Get found item details for the email
                                        found_item = get_item_by_id(found_item_id)
                                        found_item_name = found_item.get(
                                            "name", "Found Item"
                                        )
                                        found_item_description = found_item.get(
                                            "description", ""
                                        )

                                        store_potential_matches(
                                            match["foundItemId"],
                                            match["lostItemId"],
                                            match["weightedConfidence"],
                                            match["distance"],
                                        )

                                        # Send notification to owner about potential match
                                        try:
                                            # Make HTTP request to email service
                                            requests.post(
                                                "http://email:3001/api/found-items/notify",
                                                json={
                                                    "itemId": found_item_id,
                                                    "itemName": found_item_name,
                                                    "itemDescription": found_item_description,
                                                    "ownerEmail": owner_details[
                                                        "email"
                                                    ],
                                                },
                                            )
                                            print(
                                                f"Email notification sent to owner about potential match for {lost_item_id}"
                                            )
                                        except Exception as email_err:
                                            print(
                                                f"Error sending email notification: {email_err}"
                                            )
                                        consumer.commit()

        except Exception as e:
            print(f"Error processing message: {e}")
            # Don't commit offset to allow retry on next startup


if __name__ == "__main__":
    start_consumer()
