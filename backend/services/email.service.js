const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP connection error:', error);
      } else {
        console.log('SMTP server is ready to take messages');
      }
    });
  }

  async sendContactEmail(name, email, message) {
    try {
      console.log('Preparing to send contact email from:', email);
      
      const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        replyTo: email,
        to: process.env.EMAIL_USER,
        subject: `New Contact Form Message from ${name}`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Contact email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send email: ' + error.message);
    }
  }

  async sendWelcomeEmail(email, name) {
    try {
      console.log('Sending welcome email to:', email);
      
      const mailOptions = {
        from: `"Wall of Humanity" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to Wall of Humanity',
        html: `
          <h2>Welcome to Wall of Humanity, ${name}!</h2>
          <p>Thank you for joining our community. We're excited to have you with us.</p>
          <p>Together, we can make a difference in people's lives.</p>
          <br>
          <p>Best regards,</p>
          <p>The Wall of Humanity Team</p>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Welcome email error:', error);
      throw new Error('Failed to send welcome email: ' + error.message);
    }
  }
}

// Create and export a single instance
const emailService = new EmailService();
module.exports = emailService;