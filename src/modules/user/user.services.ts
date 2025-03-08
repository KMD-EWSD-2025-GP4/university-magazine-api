import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../../db';
import { faculty, user } from '../../db/schema';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { registerUserBodySchema, loginUserBodySchema } from './user.schema';
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} from '../../utils/errors';
import { Role } from '../../types/roles';

async function findUserByEmail(email: string) {
  const result = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return result[0];
}

export async function getUsers() {
  // user join faculty
  return db
    .select({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      facultyId: user.facultyId,
      lastLogin: user.lastLogin,
      totalLogins: user.totalLogins,
      browser: user.browser,
      facultyName: faculty.name,
    })
    .from(user)
    .leftJoin(faculty, eq(user.facultyId, faculty.id));
}

export async function getStudentsByFaculty(facultyId: string) {
  return db
    .select({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      facultyId: user.facultyId,
      lastLogin: user.lastLogin,
      totalLogins: user.totalLogins,
      browser: user.browser,
    })
    .from(user)
    .where(and(eq(user.facultyId, facultyId), eq(user.role, 'student')));
}

export async function getGuestsByFaculty(facultyId: string) {
  return db
    .select({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      facultyId: user.facultyId,
      lastLogin: user.lastLogin,
      totalLogins: user.totalLogins,
      browser: user.browser,
    })
    .from(user)
    .where(and(eq(user.facultyId, facultyId), eq(user.role, 'guest')));
}

export async function getUserById(
  id: string,
  callerId: string,
  callerRole: Role,
) {
  // Check if caller is authorized to view user
  if (callerId !== id && callerRole !== 'admin') {
    throw new UnauthorizedError('Unauthorized to view user');
  }
  const result = await db
    .select({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      facultyId: user.facultyId,
      lastLogin: user.lastLogin,
      totalLogins: user.totalLogins,
      browser: user.browser,
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
      name: user.name,
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
  const { email, password, name, facultyId } = input;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new ValidationError('Email already registered');
  }
  // check if faculty exists
  const existingFaculty = await db
    .select()
    .from(faculty)
    .where(eq(faculty.id, facultyId))
    .limit(1);
  if (!existingFaculty.length) {
    throw new ValidationError('Faculty not found');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const result = await db
    .insert(user)
    .values({
      email,
      passwordHash,
      name,
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
    Buffer.from(env.JWT_SECRET),
    { expiresIn: env.JWT_EXPIRES_IN } as SignOptions,
  );
  // Update last login and total logins
  await db
    .update(user)
    .set({
      lastLogin: new Date(),
      totalLogins: existingUser.totalLogins + 1,
    })
    .where(eq(user.id, existingUser.id));
  return {
    user: {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role,
      facultyId: existingUser.facultyId,
    },
    token,
  };
}

export async function getMostActiveUsers() {
  return db
    .select({
      id: user.id,
      email: user.email,
      totalLogins: user.totalLogins,
      name: user.name,
      facultyId: user.facultyId,
    })
    .from(user)
    .orderBy(desc(user.totalLogins))
    .limit(10);
}

export async function getBrowserUsageStats() {
  // get count of each browser in browser enum
  return db
    .select({
      browser: user.browser,
      count: sql`COUNT(*)`,
    })
    .from(user)
    .groupBy(user.browser);
}
