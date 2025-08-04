import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cyberclipperSecretKey123!';

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
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
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    
    // Extract companyId from the decoded payload
    const { companyId } = decoded;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID not found in token' });
    }
    
    res.status(200).json({ 
      success: true, 
      companyId: companyId,
      decoded: decoded
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to decrypt token', details: error.message });
  }
} 