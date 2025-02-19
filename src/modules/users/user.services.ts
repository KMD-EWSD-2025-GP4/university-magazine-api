import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import { user } from '../../db/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { registerUserBodySchema, loginUserBodySchema } from './user.schema';
import { logger } from '../../utils/logger';
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from '../../utils/errors';

async function findUserByEmail(email: string) {
  const result = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return result[0];
}

export async function getUsers() {
  return db.select().from(user);
}

export async function getStudentsByFaculty(facultyId: string) {
  return db
    .select()
    .from(user)
    .where(and(eq(user.facultyId, facultyId), eq(user.role, 'student')));
}

export async function getUserById(id: string) {
  const result = await db
    .select({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      facultyId: user.facultyId,
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);
  if (!result.length) {
    throw new NotFoundError('User not found');
  }

  return result[0];
}

export async function getUserByEmail(email: string) {
  const result = await db
    .select({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      facultyId: user.facultyId,
    })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (!result.length) {
    throw new NotFoundError('User not found');
  }

  return result[0];
}

export async function registerUser(input: registerUserBodySchema) {
  const { email, password, firstName, lastName, facultyId } = input;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new ValidationError('Email already registered');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const result = await db
    .insert(user)
    .values({
      email,
      passwordHash,
      firstName,
      lastName,
      facultyId,
      role: 'guest', // Default role for new registrations
    })
    .returning();
  // do not return passwordHash
  const { passwordHash: _, ...userWithoutPassword } = result[0];
  return {
    user: userWithoutPassword,
    message: 'User registered successfully',
  };
}

export async function loginUser(input: loginUserBodySchema) {
  const { email, password } = input;

  // Find user by email
  const existingUser = await findUserByEmail(email);
  if (!existingUser) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(
    password,
    existingUser.passwordHash,
  );
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      sub: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
    },
    env.JWT_SECRET,
    { expiresIn: '24h' }, // Longer expiry since we don't have refresh
  );

  return {
    user: {
      id: existingUser.id,
      email: existingUser.email,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      role: existingUser.role,
      facultyId: existingUser.facultyId,
    },
    token,
  };
}
