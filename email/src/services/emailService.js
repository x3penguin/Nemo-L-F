const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.smtpServer,
      port: config.email.smtpPort,
      secure: config.email.smtpPort === 465,
      auth: {
        user: config.email.smtpUser,
        pass: config.email.smtpPassword
      },
      tls: {
        rejectUnauthorized: false // Allows self-signed certificates
      }
    });
  }
  
  async sendEmail(to, subject, body) {
    try {
      const mailOptions = {
        from: config.email.from,
        to,
        subject,
        text: body
      };
      
      const info = await this.transporter.sendMail(mailOptions);

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();