# matching/consumer.py
from kafka import KafkaConsumer, KafkaProducer
import json
import os
import datetime
from image_match.image_matcher import match_images
from location_match.location_matcher import match_locations
from firebase_client import store_potential_matches


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

            # Run image matching algorithm
            best_image_matches = match_images(item_id, image_url)

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
                                # Store the match details for potential matches view
                                store_potential_matches(
                                    match['foundItemId'],
                                    match['lostItemId'],
                                    match['weightedConfidence'],
                                    match['distance']
                                )
            consumer.commit()

        except Exception as e:
            print(f"Error processing message: {e}")
            # Don't commit offset to allow retry on next startup


if __name__ == "__main__":
    start_consumer()
