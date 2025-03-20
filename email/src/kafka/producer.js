const { Kafka } = require('kafkajs');
const config = require('../config');

class KafkaProducer {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'nemo-lf-producer',
      brokers: config.kafka.brokers
    });
    
    this.producer = this.kafka.producer();
    this.connected = false;
  }

  async connect() {
    if (!this.connected) {
      await this.producer.connect();
      this.connected = true;
      console.log('Kafka producer connected');
    }
  }

  async disconnect() {
    if (this.connected) {
      await this.producer.disconnect();
      this.connected = false;
      console.log('Kafka producer disconnected');
    }
  }

  async sendItemFoundNotification(itemData) {
    try {
      await this.connect();
      
      const message = {
        key: itemData.itemId,
        value: JSON.stringify(itemData)
      };
      
      const result = await this.producer.send({
        topic: config.kafka.topics.foundItems,
        messages: [message]
      });
      
      console.log(`Message sent successfully: ${JSON.stringify(result)}`);
      return { success: true, result };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  // New method for sending image matching job
  async sendImageMatchingJob(itemId, imageUrl) {
    try {
      await this.connect();
      
      const message = {
        key: itemId,
        value: JSON.stringify({
          itemId: itemId,
          imageUrl: imageUrl,
          timestamp: new Date().toISOString()
        })
      };
      
      const result = await this.producer.send({
        topic: 'image-matching-jobs', // Or use config.kafka.topics.matchingJobs
        messages: [message]
      });
      
      console.log(`Image matching job sent for item ${itemId}`);
      return { success: true, result };
    } catch (error) {
      console.error('Error sending image matching job:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new KafkaProducer();