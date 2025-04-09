const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const kafkaProducer = require('./kafka/producer');
// const kafkaConsumer = require('./kafka/consumer');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('../swagger-output.json');

// Initialize Express app
const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
const potentialMatchConsumer = require('./kafka/potential-match-consumer');

// Middleware
app.use(bodyParser.json());

require('dotenv').config();
app.use(cors());
// post notifcation
app.post('/api/found-items/notify', async (req, res) => {
  try {
    const { itemId, itemName, itemDescription, ownerEmail } = req.body;

    // Validate required fields
    if (!itemId || !itemName || !ownerEmail) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Send notification via Kafka
    const result = await kafkaProducer.sendItemFoundNotification({
      itemId,
      itemName,
      itemDescription,
      ownerEmail,
    });

    if (result.success) {
      res.status(200).json({ success: true, message: 'Notification sent successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Start the server
const PORT = config.api.port;
app.listen(PORT, async () => {


  // Start Kafka consumers
  // await kafkaConsumer.startListening();
  await potentialMatchConsumer.startListening();
});