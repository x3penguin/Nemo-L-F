const { Kafka } = require('kafkajs');
const config = require('../config');
const emailService = require('../services/emailService');

class KafkaConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'nemo-lf-consumer',
      brokers: config.kafka.brokers
    });
    
    this.consumer = this.kafka.consumer({ 
      groupId: config.kafka.groupId 
    });
    
    this.connected = false;
  }

  async connect() {
    if (!this.connected) {
      await this.consumer.connect();
      this.connected = true;
      console.log('Kafka consumer connected');
    }
  }

  async disconnect() {
    if (this.connected) {
      await this.consumer.disconnect();
      this.connected = false;
      console.log('Kafka consumer disconnected');
    }
  }

  async startListening() {
    try {
      await this.connect();
      
      await this.consumer.subscribe({ 
        topic: config.kafka.topics.foundItems, 
        fromBeginning: false 
      });
      
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const itemData = JSON.parse(message.value.toString());
            console.log(`Received message: ${JSON.stringify(itemData)}`);
            
            // Send email notification
            await this.processItemFound(itemData);
            
          } catch (error) {
            console.error('Error processing message:', error);
          }
        }
      });
      
      console.log(`Started listening to topic: ${config.kafka.topics.foundItems}`);
    } catch (error) {
      console.error('Error starting Kafka consumer:', error);
    }
  }
  
  async processItemFound(itemData) {
    const { itemName, itemDescription, ownerEmail } = itemData;
    
    const subject = `Your Lost Item Has Possibly Been Found: ${itemName}`;
    const body = `
      Good news! Your lost item has possibly been found. Go into the app to verify if it is yours.
      
      Item: ${itemName}
      Description: ${itemDescription}
            
      Best regards,
      Nemo Lost & Found Team
    `;
    
    await emailService.sendEmail(ownerEmail, subject, body);
    console.log(`Email notification sent to ${ownerEmail} (ends up in spam)`);
  }
}

module.exports = new KafkaConsumer();