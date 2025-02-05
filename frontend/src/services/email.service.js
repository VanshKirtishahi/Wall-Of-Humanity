import emailjs from '@emailjs/browser';

class EmailService {
  constructor() {
    // Use the same public key that's working in RequestForm
    emailjs.init("SN0gt1KyKuhHK0iGZ");
  }

  async sendWelcomeEmail(userEmail, userName) {
    try {
      console.log('Sending welcome email to:', userEmail, userName);

      const templateParams = {
        to_name: userName,
        user_email: userEmail,
        from_name: "Wall of Humanity"
      };

      const response = await emailjs.send(
        "service_fyxy71o",
        "template_7yypapp",  // Use your new template ID here
        templateParams
      );
      
      console.log('Welcome email sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  async sendContactEmail(formData) {
    try {
      const templateParams = {
        from_name: formData.name,
        user_email: formData.email,
        message: formData.message,
        subject: formData.subject || 'Contact Form Submission'
      };

      const response = await emailjs.send(
        "service_fyxy71o",
        "template_7yypapp",
        templateParams
      );

      if (!response.status === 200) {
        throw new Error('Failed to send message');
      }

      return response;
    } catch (error) {
      console.error('Contact email error:', error);
      throw new Error(error.message || 'Failed to send message');
    }
  }
}

// Create a singleton instance
export const emailService = new EmailService();
export default EmailService; 