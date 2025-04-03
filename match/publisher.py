from kafka import KafkaProducer
import json
import os
from dotenv import load_dotenv

load_dotenv()

def create_producer():
    kafka_brokers = os.environ.get('KAFKA_BROKERS')
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