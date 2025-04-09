const { Kafka } = require('kafkajs');
const config = require('../config');
const emailService = require('../services/emailService');

const admin = require('firebase-admin');

// Initialize Firebase if not already done
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(process.env.FILE_PATH)),
    storageBucket: process.env.STORAGE_BUCKET
  });
}

const db = admin.firestore();

class PotentialMatchConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'email-service-potential-match-consumer',
      brokers: config.kafka.brokers
    });
    
    this.consumer = this.kafka.consumer({ 
      groupId: 'email-service-potential-match-group'
    });
  }

  async connect() {
    await this.consumer.connect();
  }

  async startListening() {
    try {
      await this.connect();
      
      await this.consumer.subscribe({
        topic: 'potential-match-notifications',
        fromBeginning: false
      });
      
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const matchData = JSON.parse(message.value.toString());

            
            if (matchData.ownerId) {
              const userDoc = await db.collection('users').doc(matchData.ownerId).get();
              
              if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.email) {
                  // Send email notification
                  await this.sendPotentialMatchEmail(
                    userData.email, 
                    matchData.lostItemName,
                    matchData.foundItemName,
                    matchData.confidence
                  );
                }
              }
            }
          } catch (error) {
            console.error('Error processing potential match notification:', error);
          }
        }
      });
    } catch (error) {
      console.error('Error starting potential match consumer:', error);
    }
  }
  
  async sendPotentialMatchEmail(email, lostItemName, foundItemName, confidence) {
    const subject = `Potential match found for your lost item: ${lostItemName}`;
    const body = `
      Hello,
      
      A potential match has been found for your lost item "${lostItemName}".
      
      Someone has reported finding "${foundItemName}" which has a ${confidence.toFixed(2)}% match with your item.
      
      Please login to the app to view this potential match and confirm if it's yours.
      
      Best regards,
      The Nemo Lost & Found Team
    `;
    
    await emailService.sendEmail(email, subject, body);
  }
}

module.exports = new PotentialMatchConsumer();