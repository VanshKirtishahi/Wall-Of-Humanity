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
  }

  async sendWelcomeEmail(userEmail, userName) {
    try {
      console.log('Sending welcome email to:', userEmail, userName);

      const mailOptions = {
        from: `"Wall of Humanity" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Welcome to Wall of Humanity',
        html: `
          <h2>Welcome to Wall of Humanity, ${userName}!</h2>
          <p>Thank you for joining our community. We're excited to have you on board!</p>
          <p>Together, we can make a difference.</p>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  async sendContactEmail(formData) {
    try {
      const mailOptions = {
        from: `"${formData.name}" <${formData.email}>`,
        to: process.env.EMAIL_USER,
        subject: formData.subject || 'Contact Form Submission',
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>From:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Message:</strong> ${formData.message}</p>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error('Contact email error:', error);
      throw error;
    }
  }
}

module.exports = new EmailService(); 