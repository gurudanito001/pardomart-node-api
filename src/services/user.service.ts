// user.service.ts
import * as userModel from '../models/user.models'; // Import functions from user.model.ts
import { Verification, User } from '@prisma/client';
import { GetUserFilters, CreateUserPayload, UpdateUserPayload } from '../models/user.models'; // Import types


interface CheckUserFilters {
  mobileNumber: string;
}



export const getAllUsers = async (filters: GetUserFilters, pagination: {page: string, take: string}) => {
  return userModel.getAllUsers(filters, pagination);
};

export const getAllVerificationCodes = async (): Promise<Verification[]> => {
  return userModel.getAllVerificationCodes();
};

export const getUserById = async (userId: string) => {
  return userModel.getUserById(userId);
};

export const createUser = async (payload: CreateUserPayload) => {
  return userModel.createUser(payload);
};

export const updateUser = async (payload: UpdateUserPayload) => {
  return userModel.updateUser(payload);
};

export const deleteUser = async (userId: string) => {
  return userModel.deleteUser(userId);
};