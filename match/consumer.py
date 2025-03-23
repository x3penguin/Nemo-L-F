# matching/consumer.py
from kafka import KafkaConsumer, KafkaProducer
import json
import os
import datetime
from image_matcher import match_images
from firebase_client import update_matched_items

def create_producer():
    kafka_brokers = os.environ.get('KAFKA_BROKERS', 'localhost:9092').split(',')
    producer = KafkaProducer(
        bootstrap_servers=kafka_brokers,
        value_serializer=lambda v: json.dumps(v).encode('utf-8'),
        key_serializer=lambda k: str(k).encode('utf-8')
    )
    return producer

def publish_match_notification(match_data):
    """Publish match notification to Kafka"""
    try:
        producer = create_producer()
        producer.send(
            'match-notifications', 
            key=match_data['lostItemId'],
            value=match_data
        )
        producer.flush()
        print(f"Published match notification: {match_data}")
        return True
    except Exception as e:
        print(f"Error publishing match notification: {e}")
        return False

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
                matched_item_id = match_result['matched_item_id']
                confidence = match_result['confidence']
                
                print(f"Match found! Item {item_id} matches with {matched_item_id} with confidence {confidence:.2f}%")
                
                # Update items as matched in Firebase
                update_matched_items(
                    item_id, 
                    matched_item_id,
                    confidence
                )
                
                # Publish match notification event to Kafka
                publish_match_notification({
                    'lostItemId': matched_item_id,
                    'foundItemId': item_id,
                    'confidence': confidence,
                    'timestamp': datetime.datetime.now().isoformat()
                })
            else:
                print(f"No matches found above threshold for item {item_id}")
            
            # Commit offset after successful processing
            consumer.commit()
            
        except Exception as e:
            print(f"Error processing message: {e}")
            # Don't commit offset to allow retry on next startup

if __name__ == "__main__":
    start_consumer()