// Simple SMTP test endpoint
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const nodemailer = require('nodemailer');
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Test connection
    await transporter.verify();
    
    // Send test email
    const testEmail = {
      from: `"Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: 'SMTP Test - Intern Management System',
      html: `
        <h2>SMTP Configuration Test</h2>
        <p>This is a test email to verify that SMTP is working correctly.</p>
        <p>If you receive this email, the SMTP configuration is working!</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
      text: 'SMTP Test - If you receive this email, the SMTP configuration is working!'
    };

    const result = await transporter.sendMail(testEmail);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Test email sent successfully',
      messageId: result.messageId 
    });

  } catch (error) {
    console.error('SMTP Test Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

