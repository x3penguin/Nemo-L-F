// email/src/kafka/match-notification-consumer.js
const { Kafka } = require('kafkajs');
const config = require('../config');
const emailService = require('../services/emailService');
const admin = require('firebase-admin');

// Initialize Firebase if not already done elsewhere
console.log(process.env.FIREBASE_DATABASE_URL)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../esd-nemo-firebase-adminsdk-fbsvc-fbe963cc58.json')),
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
    console.log('Match notification consumer connected');
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
            console.log(`Received match notification: ${JSON.stringify(matchData)}`);
            
            // Get item details directly from Firestore
            const lostItemDoc = await db.collection('items').doc(matchData.lostItemId).get();
            
            if (!lostItemDoc.exists) {
              console.log(`Lost item ${matchData.lostItemId} not found`);
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
                  console.log(`Owner ${lostItem.ownerId} has no email address`);
                }
              } else {
                console.log(`Owner ${lostItem.ownerId} not found`);
              }
            }
          } catch (error) {
            console.error('Error processing match notification:', error);
          }
        }
      });
      
      console.log('Started listening for match notifications');
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
    console.log(`Match notification email sent to ${email}`);
  }
}

module.exports = new MatchNotificationConsumer();