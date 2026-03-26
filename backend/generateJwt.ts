import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const token = jwt.sign(
    { userId: 'a9af35ed-41af-4f84-bec9-c2807a6dc6e3', role: 'ADMIN' },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
);
console.log('generated_jwt:', token);
