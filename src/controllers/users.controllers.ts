import { Request, Response } from 'express';
import * as userService from '../services/user.service'; // Assuming you have a user.service.ts file
import { User } from '@prisma/client'; // Import User type

// User Controllers


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers(req.query); // Pass query params for filtering
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllVerificationCodes = async (req: Request, res: Response) => {
  try {
    const verificationCodes = await userService.getAllVerificationCodes();
    res.status(200).json(verificationCodes);
  } catch (error) {
    console.error('Error getting all verification codes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const updatedUser = await userService.updateUser({ id: userId, ...req.body });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const deletedUser = await userService.deleteUser(userId);
    res.status(200).json(deletedUser);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};