const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret';

const getUserFromToken = (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { userId: decoded.userId };
  } catch (error) {
    return null;
  }
};

module.exports = { getUserFromToken }; 