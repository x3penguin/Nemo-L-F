const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  kafka: {
    brokers: process.env.KAFKA_BROKERS.split(','),
    topics: {
      foundItems: process.env.KAFKA_TOPIC_FOUND_ITEMS 
    },
    groupId: process.env.KAFKA_GROUP_ID  
  },
  email: {
    smtpServer: process.env.SMTP_SERVER,
    smtpPort: parseInt(process.env.SMTP_PORT) ,
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM
  },
  api: {
    port: parseInt(process.env.PORT)
  }
};