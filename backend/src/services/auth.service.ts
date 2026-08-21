import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { env } from '../config/env';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export async function registerUser(dto: RegisterDTO) {
  const existingUser = await prisma.user.findUnique({
    where: { email: dto.email.toLowerCase().trim() },
  });

  if (existingUser) {
    throw new Error('An account with this email address already exists.');
  }

  const hashedPassword = await bcrypt.hash(dto.password, 12);

  const user = await prisma.user.create({
    data: {
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
      password: hashedPassword,
      storageLimit: env.DEFAULT_STORAGE_LIMIT_BYTES,
      storageUsed: 0,
    },
  });

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    env.JWT_SECRET,
    { expiresIn: '7d' as const }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      storageLimit: user.storageLimit,
      storageUsed: user.storageUsed,
      createdAt: user.createdAt,
    },
    token,
  };
}

export async function loginUser(dto: LoginDTO) {
  const user = await prisma.user.findUnique({
    where: { email: dto.email.toLowerCase().trim() },
  });

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const isPasswordValid = await bcrypt.compare(dto.password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password.');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    env.JWT_SECRET,
    { expiresIn: '7d' as const }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      storageLimit: user.storageLimit,
      storageUsed: user.storageUsed,
      createdAt: user.createdAt,
    },
    token,
  };
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      storageLimit: true,
      storageUsed: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { images: true },
      },
    },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  return {
    ...user,
    totalImages: user._count.images,
  };
}
