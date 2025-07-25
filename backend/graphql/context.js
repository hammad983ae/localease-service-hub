import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_jwt_secret'; // Should match your main config

export const getUserFromToken = (req) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      return jwt.verify(auth.split(' ')[1], JWT_SECRET);
    } catch {
      return null;
    }
  }
  return null;
}; 