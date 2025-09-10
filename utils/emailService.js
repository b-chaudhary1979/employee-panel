const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

/**
 * Create reusable transporter object using SMTP transport
 */
const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.'
    );
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * --------------------------
 * INTERN WELCOME EMAIL
 * --------------------------
 */
const sendWelcomeEmailToIntern = async (internData, companyId) => {
  try {
    const transporter = createTransporter();
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const loginUrl = `${baseUrl}/auth/login?companyId=${companyId}`;

    const mailOptions = {
      from: `"${internData.company || 'Company'}" <${process.env.SMTP_USER}>`,
      to: internData.email, // ✅ send to intern
      subject: `Welcome to ${internData.company || 'the company'} 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color:#16a34a;">Welcome, ${internData.name}!</h2>
          <p>We’re excited to have you join <b>${
            internData.company || 'our team'
          }</b>.</p>
          <p>Here are your login details:</p>
          <ul>
            <li><strong>Company ID:</strong> ${companyId}</li>
            <li><strong>Intern ID:</strong> ${internData.internId}</li>
          </ul>
          <p>
            You can log in using this link:<br/>
            <a href="${loginUrl}" style="color:#16a34a;">${loginUrl}</a>
          </p>
          <p>Wishing you a great start! 🚀</p>
          <br/>
          <p><em>This is an automated email. Please do not reply.</em></p>
        </div>
      `,
      text: `
        Welcome, ${internData.name}!
        
        We’re excited to have you join ${internData.company || 'our team'}.
        
        Your login details:
        - Company ID: ${companyId}
        - Intern ID: ${internData.internId}
        
        Login URL: ${loginUrl}
        
        Wishing you a great start!
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to intern:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email to intern:', error);
    return { success: false, error: error.message };
  }
};

/**
 * --------------------------
 * EMPLOYEE NOTIFICATION EMAIL
 * --------------------------
 */
const sendInternNotificationToEmployee = async (
  internData,
  companyId,
  employeeEmail,
  employeeName
) => {
  try {
    const transporter = createTransporter();
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const loginUrl = `${baseUrl}/auth/login?companyId=${companyId}`;

    const mailOptions = {
      from: `"${internData.company || 'Company'}" <${process.env.SMTP_USER}>`,
      to: employeeEmail, // ✅ send to employee
      subject: `New Intern Registered - ${internData.name} (${internData.internId})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color:#16a34a;">New Intern Registration</h2>
          <p>Dear <b>${employeeName}</b>,</p>
          <p>A new intern has been successfully registered. Here are the details:</p>
          <ul>
            <li><strong>Name:</strong> ${internData.name}</li>
            <li><strong>Email:</strong> ${internData.email}</li>
            <li><strong>Department:</strong> ${internData.department}</li>
            <li><strong>Role:</strong> ${internData.role}</li>
            <li><strong>Intern ID:</strong> ${internData.internId}</li>
          </ul>
          <p>
            Login URL for interns: <a href="${loginUrl}" style="color:#16a34a;">${loginUrl}</a>
          </p>
          <br/>
          <p><em>This is an automated notification. Please do not reply.</em></p>
        </div>
      `,
      text: `
        New Intern Registered
        
        Dear ${employeeName},
        
        A new intern has been successfully registered.
        
        Intern Details:
        - Name: ${internData.name}
        - Email: ${internData.email}
        - Department: ${internData.department}
        - Role: ${internData.role}
        - Intern ID: ${internData.internId}
        
        Login URL for interns: ${loginUrl}
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📩 Notification sent to employee:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending notification to employee:', error);
    return { success: false, error: error.message };
  }
};

/**
 * --------------------------
 * TEST EMAIL CONFIGURATION
 * --------------------------
 */
const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ SMTP configuration is valid');
    return { success: true, message: 'SMTP configuration is valid' };
  } catch (error) {
    console.error('❌ SMTP configuration error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmailToIntern,
  sendInternNotificationToEmployee,
  testEmailConfiguration,
  createTransporter,
};
