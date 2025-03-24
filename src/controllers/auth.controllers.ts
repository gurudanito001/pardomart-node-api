// controllers/auth.controller.ts
import { Request, Response } from 'express';
import * as authService from '../services/auth.service'; // Create this file
import * as userService from '../services/user.service'
import { generateVerificationCode, sendVerificationCode } from '../utils/verification'; // Create this file.



export const checkUserExistence = async (req: Request, res: Response) => {
  try {
    const { mobileNumber } = req.body;
    const user = await authService.checkUserExistence({ mobileNumber });

    if (user) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking user existence:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const registerUser = async (req: Request, res: Response) => {
  try {
    const newUser = await userService.createUser(req.body);

    const verificationCode = generateVerificationCode();
    await authService.storeVerificationCode(newUser?.mobileNumber, verificationCode);
    await sendVerificationCode(newUser?.mobileNumber, verificationCode);

    res.json({ message: 'Verification code sent', user: newUser });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { mobileNumber } = req.body;

    // Check if the user exists
    const userExists = await authService.checkUser({ mobileNumber });
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const verificationCode = generateVerificationCode();
    await authService.storeVerificationCode(mobileNumber, verificationCode);
    await sendVerificationCode(mobileNumber, verificationCode);

    res.json({ message: 'Verification code resent' });
  } catch (error) {
    console.error('Error resending verification code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyRegistrationCode = async (req: Request, res: Response) => {
  try {
    const { mobileNumber, verificationCode } = req.body;
    const user = await authService.verifyRegistrationCode(mobileNumber, verificationCode);

    if (!user) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    res.json({ message: 'Verification successful', user });
  } catch (error) {
    console.error('Error verifying registration code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const initiateLogin = async (req: Request, res: Response) => {
  try {
    const { mobileNumber } = req.body;
    const userExists = await authService.checkUser({ mobileNumber });

    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const verificationCode = generateVerificationCode();
    await authService.storeVerificationCode(mobileNumber, verificationCode);
    await sendVerificationCode(mobileNumber, verificationCode);

    res.json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Error initiating login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyCodeAndLogin = async (req: Request, res: Response) => {
  try {
    const { mobileNumber, verificationCode } = req.body;
    const user = await authService.verifyCodeAndLogin(mobileNumber, verificationCode);

    if (!user) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }
    res.json(user); // user object containing token.
  } catch (error) {
    console.error('Error verifying code and logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};