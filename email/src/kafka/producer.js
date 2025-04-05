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

    }
  }

  async disconnect() {
    if (this.connected) {
      await this.producer.disconnect();
      this.connected = false;

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
      

      return { success: true, result };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

}

module.exports = new KafkaProducer();