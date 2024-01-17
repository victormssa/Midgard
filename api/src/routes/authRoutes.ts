import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from '@fastify/jwt';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { db } from './../database/db';

dotenv.config();

interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  company_name: string;
  phone: string;
}

interface LoginPayload {
  username: string;
  password: string;
}

const generateUniqueUserId = (): string => {
  return uuidv4();
};

const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

const registerUser = async (userData: RegisterPayload): Promise<string> => {
  const userId = generateUniqueUserId();
  const hashedPassword = await hashPassword(userData.password);

  try {
    await db.none(
      'INSERT INTO public.users (id, username, password, email, company_name, phone) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, userData.username, hashedPassword, userData.email, userData.company_name, userData.phone]
    );

    return userId;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

const loginUser = async (username: string, password: string): Promise<string | null> => {
  try {
    const user = await db.oneOrNone('SELECT * FROM public.users WHERE username = $1', username);

    if (!user) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return null;
    }

    return user.id;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

const authRoutes = async (fastify: FastifyInstance) => {
  fastify.register(jwt, { secret: process.env.JWT_SECRET || 'default_secret_key' });

  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userData: RegisterPayload = request.body as RegisterPayload;

      const userId = await registerUser(userData);
      const token = fastify.jwt.sign({ id: userId });

      reply.send({ token });
    } catch (error) {
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { username, password }: LoginPayload = request.body as LoginPayload;

      const userId = await loginUser(username, password);

      if (!userId) {
        reply.status(401).send({ error: 'Invalid credentials' });
        return;
      }

      const token = fastify.jwt.sign({ id: userId });
      reply.send({ token, userId });
    } catch (error) {
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
};

export default authRoutes;