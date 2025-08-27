import jwt from "jsonwebtoken";

const JWT_SECRET = "cyberclipperSecretKey123!";

export default function handler(req, res) {
  // Set CORS headers
  const allowedOrigins = [
    "https://intern-management-system-2-zeta.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Extract companyId from the decoded payload
    const { companyId } = decoded;

    if (!companyId) {
      return res.status(400).json({ error: "Company ID not found in token" });
    }

    res.status(200).json({
      success: true,
      companyId: companyId,
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(400)
        .json({ error: "Invalid JWT token format", details: error.message });
    } else if (error.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ error: "JWT token has expired", details: error.message });
    }

    res
      .status(500)
      .json({ error: "Failed to verify JWT token", details: error.message });
  }
}
