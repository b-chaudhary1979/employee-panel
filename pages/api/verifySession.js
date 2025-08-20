import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    // Validate required parameters
    if (!token) {
      return res.status(400).json({ 
        error: 'Missing required parameter: token' 
      });
    }

    // Get JWT secret from environment
    const SESSION_SECRET = process.env.SESSION_SECRET;
    if (!SESSION_SECRET) {
      return res.status(500).json({ 
        error: 'SESSION_SECRET not configured' 
      });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, SESSION_SECRET, { algorithms: ['HS256'] });
    
    return res.status(200).json({ 
      success: true,
      sessionData: {
        companyId: decoded.companyId,
        employeeId: decoded.employeeId
      }
    });

  } catch (error) {
   
    return res.status(400).json({ 
      success: false,
      error: 'Invalid token',
      details: error.message 
    });
  }
}
