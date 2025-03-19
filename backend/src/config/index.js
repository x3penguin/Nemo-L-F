// smtp pw - wnba nwyj mdwu zgrn
// http://localhost:3001/api/found-items/notify - post via postman to test notif email 

// module.exports = {
//   kafka: {
//     brokers: ['localhost:9092'],
//     topics: {
//       foundItems: 'found-items',
//       matchingJobs: 'image-matching-jobs' 
//     },
//     groupId: 'nemo-lf-email-group'
//   },
//   email: {
//     smtpServer: 'smtp.gmail.com',  // Or your SMTP server
//     smtpPort: 587,
//     smtpUser: 'finding.nemo.esd@gmail.com',  // Your email
//     smtpPassword: 'wnba nwyj mdwu zgrn',  // Your password
//     from: 'finding.nemo.esd@gmail.com'  
//   },
//   api: {
//     port: 3001
//   }
// };

// not working ENV below
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  kafka: {
    brokers: process.env.KAFKA_BROKERS.split(','),
    topics: {
      foundItems: process.env.KAFKA_TOPIC_FOUND_ITEMS || 'found-items'
    },
    groupId: process.env.KAFKA_GROUP_ID || 'nemo-lf-email-group'
  },
  email: {
    smtpServer: process.env.SMTP_SERVER,
    smtpPort: parseInt(process.env.SMTP_PORT) || 587,
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM
  },
  api: {
    port: parseInt(process.env.PORT) || 3001
  }
};