const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'USE_A_SECRET';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token required' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid token format' });

  const token = parts[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload; 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
