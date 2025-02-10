import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/config.js';
import prisma from '../config/db.config.js';

const { compare } = bcrypt;
const { sign } = jwt;

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    // Fetch user by email
    const user = await prisma.userAccounts.findFirst({
      where: { Email: email },
    });
    
    if (!user) {
      return res.status(200).json({ msg: 'Invalid user', status_code: 400 });
    }


    // Password comparison
    const isMatch = await compare(password, user?.PasswordHash);
    if (!isMatch) {
      await prisma.userAccounts.update({
        where: { EmployeeID: user.EmployeeID },
        data: {
          FailedLoginAttempts: (user.FailedLoginAttempts || 0) + 1,
        },
      });
      return res
        .status(200)
        .json({ msg: 'Invalid email or password', status_code: 400 });
      }

    // Generate JWT

    const token = sign(
      { eid:  String(user.EmployeeID), role: user.Role, name: user.Username },
      jwtSecret,
      { algorithm: 'HS256', expiresIn: '5h' }
    );

    // Update last login date
    try {
      await prisma.userAccounts.update({
        where: { EmployeeID: user.EmployeeID },
        data: { LastLoginDate: new Date() },
      });
      console.log('Updated last login');
    } catch (error) {
      console.error('Could not update last login time:', error.message);
    }

    // Fetch additional user data
    const userData = await prisma.employees.findFirst({
      where: { EmployeeID: String(user.EmployeeID) },
    });

    // Respond with success
    res.json({
      status_code: 200,
      msg: 'Login successful',
      data: userData,
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: `Server error - ${error.message}`, status_code: 500 });
  }
};

const authRoutes = Router();
authRoutes.post('/login', login );




// router.post('/otp', getOTP)

// router.post('/verify_otp', validateOTP)

// router.post('/reset', authenticate, resetPassowrd)




export default authRoutes;
