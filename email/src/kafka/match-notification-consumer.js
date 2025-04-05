// email/src/kafka/match-notification-consumer.js
const { Kafka } = require('kafkajs');
const config = require('../config');
const emailService = require('../services/emailService');
const admin = require('firebase-admin');

// Initialize Firebase if not already done elsewhere

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(process.env.FILE_PATH)),
    storageBucket: process.env.STORAGE_BUCKET
  });
}

const db = admin.firestore();

class MatchNotificationConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'email-service-match-consumer',
      brokers: config.kafka.brokers
    });
    
    this.consumer = this.kafka.consumer({ 
      groupId: 'email-service-match-group'
    });
  }

  async connect() {
    await this.consumer.connect();

  }

  async startListening() {
    try {
      await this.connect();
      
      await this.consumer.subscribe({
        topic: 'match-notifications',
        fromBeginning: false
      });
      
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const matchData = JSON.parse(message.value.toString());

            
            // Get item details directly from Firestore
            const lostItemDoc = await db.collection('items').doc(matchData.lostItemId).get();
            
            if (!lostItemDoc.exists) {

              return;
            }
            
            const lostItem = lostItemDoc.data();
            
            // Get owner email
            if (lostItem.ownerId) {
              const ownerDoc = await db.collection('users').doc(lostItem.ownerId.toString()).get();
              
              if (ownerDoc.exists) {
                const owner = ownerDoc.data();
                if (owner.email) {
                  // Send email notification
                  await this.sendMatchNotificationEmail(owner.email, lostItem, matchData);
                } else {

                }
              } else {

              }
            }
          } catch (error) {
            console.error('Error processing match notification:', error);
          }
        }
      });
      

    } catch (error) {
      console.error('Error starting match notification consumer:', error);
    }
  }
  
  async sendMatchNotificationEmail(email, item, matchData) {
    const subject = `Good news! Your lost item has been found`;
    const body = `
      Hello,
      
      We're pleased to inform you that your lost item "${item.name}" has been matched with a found item.
      
      The match confidence level is ${matchData.confidence.toFixed(2)}%.
      
      Please log in to your account to arrange collection of your item.
      
      Best regards,
      The Nemo Lost & Found Team
    `;
    
    await emailService.sendEmail(email, subject, body);

  }
}

module.exports = new MatchNotificationConsumer();