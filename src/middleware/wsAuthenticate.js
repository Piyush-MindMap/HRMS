import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/config.js';

const wsAuthenticate = (req, callback) =>{
  const token = req.url.split('/')[1]; // Extract the token from the path

  if (!token) {
    return callback('Token is missing', null);
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    callback(null, decoded); // Pass the decoded info back
  } catch (err) {
    callback('Invalid token', null);
  }
}

export default wsAuthenticate;
