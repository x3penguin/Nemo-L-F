# matching/consumer.py
from kafka import KafkaConsumer
import json
import os
from image_matcher import match_images
from firebase_client import update_matched_items

def start_consumer():
    # Get configuration from environment variables or use defaults
    kafka_brokers = os.environ.get('KAFKA_BROKERS', 'localhost:9092').split(',')
    kafka_topic = os.environ.get('KAFKA_TOPIC', 'image-matching-jobs')
    kafka_group = os.environ.get('KAFKA_GROUP_ID', 'nemo-lf-matching-group')
    
    print(f"Connecting to Kafka brokers: {kafka_brokers}")
    print(f"Listening on topic: {kafka_topic}")
    
    consumer = KafkaConsumer(
        kafka_topic,
        bootstrap_servers=kafka_brokers,
        auto_offset_reset='earliest',
        enable_auto_commit=False,
        group_id=kafka_group,
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    
    print("Kafka consumer started, waiting for matching jobs...")
    
    for message in consumer:
        try:
            # Process the matching job
            data = message.value
            
            # Extract fields based on your team's message format
            # Adjust these field names to match what your JavaScript producer sends
            item_id = data.get('itemId')
            image_url = data.get('imageUrl')
            
            if not item_id or not image_url:
                print(f"Missing required fields in message: {data}")
                consumer.commit()
                continue
                
            print(f"Processing image matching for item {item_id}")
            
            # Run image matching algorithm
            match_result = match_images(item_id, image_url)
            
            if match_result and match_result.get('matched_item_id'):
                # Update items as matched in Firebase
                update_matched_items(
                    item_id, 
                    match_result['matched_item_id'],
                    match_result['confidence']
                )
                print(f"Match found with confidence {match_result['confidence']:.2f}%")
            else:
                print("No matches found above threshold")
            
            # Commit offset after successful processing
            consumer.commit()
            
        except Exception as e:
            print(f"Error processing message: {e}")
            # Don't commit offset to allow retry on next startup

if __name__ == "__main__":
    start_consumer()