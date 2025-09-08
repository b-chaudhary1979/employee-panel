import { testEmailConfiguration, sendInternWelcomeEmail } from '../../utils/emailService';

export default async function handler(req, res) {
  // Set CORS headers
  const allowedOrigins = [
    'https://intern-management-system-2-zeta.vercel.app/',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { testType, internData, companyId } = req.body;

    if (testType === 'configuration') {
      // Test SMTP configuration
      const result = await testEmailConfiguration();
      return res.status(200).json(result);
    } 
    else if (testType === 'welcome-email') {
      // Test sending welcome email
      if (!internData || !companyId) {
        return res.status(400).json({ 
          error: 'Intern data and company ID are required for welcome email test' 
        });
      }

      const result = await sendInternWelcomeEmail(internData, companyId);
      return res.status(200).json(result);
    }
    else {
      return res.status(400).json({ 
        error: 'Invalid test type. Use "configuration" or "welcome-email"' 
      });
    }

  } catch (error) {
    console.error('Email test error:', error);
    return res.status(500).json({ 
      error: 'Email test failed',
      details: error.message 
    });
  }
}

