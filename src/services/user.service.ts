// user.service.ts
import * as userModel from '../models/user.models'; // Import functions from user.model.ts
import { Verification } from '@prisma/client';
import { GetUserFilters, CreateUserPayload, UpdateUserPayload } from '../models/user.models'; // Import types

export const getAllUsers = async (filters: GetUserFilters) => {
  return userModel.getAllUsers(filters);
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



/* export const createSupport = async (payload: any) => {
    return userModel.createSupport(payload);
} */