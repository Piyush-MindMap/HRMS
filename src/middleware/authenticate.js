import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/config.js';

const authenticate = (req, res, next) => {
  console.log('authenticating');
  const token = req?.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(200).json({ msg: 'Access denied', status_code:400});
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log('decoded', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(200).json({ msg: 'Invalid token', status_code:400 });
  }
};

export default authenticate;
