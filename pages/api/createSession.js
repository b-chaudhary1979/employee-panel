import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { companyId, employeeId, days = 7 } = req.body;

    // Validate required parameters
    if (!companyId || !employeeId) {
      return res.status(400).json({ 
        error: 'Missing required parameters: companyId, employeeId' 
      });
    }

    // Get JWT secret from environment
    const SESSION_SECRET = process.env.SESSION_SECRET;
    if (!SESSION_SECRET) {
      return res.status(500).json({ 
        error: 'SESSION_SECRET not configured' 
      });
    }

    // Create session data
    const sessionData = { 
      companyId, 
      employeeId, 
      timestamp: Date.now()
    };
    
    // Sign the session data with JWT
    const token = jwt.sign(sessionData, SESSION_SECRET, { 
      algorithm: 'HS256',
      expiresIn: `${days}d`
    });

    return res.status(200).json({ 
      success: true,
      token: token
    });

  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(500).json({ 
      error: 'Failed to create session',
      details: error.message 
    });
  }
}
