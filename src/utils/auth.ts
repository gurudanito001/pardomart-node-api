// utils/auth.ts
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.SECRET as string;

export const generateToken = (userId: string, role: string): string => {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '30d' });
};