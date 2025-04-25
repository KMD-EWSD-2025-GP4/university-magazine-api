import { and, desc, eq, sql, gt } from 'drizzle-orm';
import { DatabaseError } from 'pg';
import { db } from '../../db';
import { faculty, loginAuditLog, user } from '../../db/schema';
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
import {
  sendEmail,
  newGuestRegistrationEmailTemplate,
 } from '../../utils/email';

async function findUserByEmail(email: string) {
  // join user with faculty as a alias facultyName
  const result = await db
    .select({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      role: user.role,
      status: user.status,
      facultyId: user.facultyId,
      facultyName: faculty.name,
      totalLogins: user.totalLogins,
    })
    .from(user)
    .leftJoin(faculty, eq(user.facultyId, faculty.id))
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
      status: user.status,
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
      status: user.status,
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
      status: user.status,
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
  try {
    // Check if caller is authorized to view user
    if (callerId !== id && callerRole !== 'admin') {
      throw new UnauthorizedError('Unauthorized to view user');
    }
    // join user with faculty as a alias facultyName
    const result = await db
      .select({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        status: user.status,
        facultyId: user.facultyId,
        facultyName: faculty.name,
        lastLogin: user.lastLogin,
        totalLogins: user.totalLogins,
        browser: user.browser,
      })
      .from(user)
      .leftJoin(faculty, eq(user.facultyId, faculty.id))
      .where(eq(user.id, id))
      .limit(1);
    if (!result.length) {
      throw new NotFoundError('User not found');
    }

    return result[0];
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid user id');
    }
    throw error;
  }
}

export async function registerUser(input: registerUserBodySchema) {
  try {
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

    // Find marketing coordinator for the faculty
    const marketingCoordinator = await db
      .select({
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(
        and(
          eq(user.facultyId, facultyId),
          eq(user.role, 'marketing_coordinator'),
        ),
      )
      .limit(1);

    if (marketingCoordinator.length > 0) {
      await sendEmail({
        to: marketingCoordinator[0].email,
        subject: 'New Guest Account Registered',
        html: newGuestRegistrationEmailTemplate({
          facultyName: existingFaculty[0].name,
          guestEmail: email,
          marketingCoordinator: marketingCoordinator[0],
        }),
      });
    }

    return {
      user: userWithoutPassword,
      message: 'User registered successfully',
    };
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '23505') {
      throw new ValidationError('Email already registered');
    }
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid faculty id');
    }
    throw error;
  }
}

export async function loginUser(input: loginUserBodySchema) {
  const { email, password, browser } = input;

  // Find user by email
  const existingUser = await findUserByEmail(email);
  if (!existingUser) {
    throw new UnauthorizedError('Invalid email or password');
  }
  if (existingUser.status === 'inactive') {
    throw new UnauthorizedError(
      'Your account is inactive, please contact your administrator',
    );
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
  // Update total logins
  await db
    .update(user)
    .set({
      lastLogin: new Date(),
      totalLogins: existingUser.totalLogins + 1,
      browser,
    })
    .where(eq(user.id, existingUser.id));
  //get last login time
  const lastLoginResult = await db
    .select({
      loginTime: loginAuditLog.loginTime,
    })
    .from(loginAuditLog)
    .where(eq(loginAuditLog.userId, existingUser.id))
    .orderBy(desc(loginAuditLog.loginTime))
    .limit(1);
  const firstTimeLogin = lastLoginResult.length === 0;
  const lastLogin = lastLoginResult[0]?.loginTime;
  // insert login audit log
  await db.insert(loginAuditLog).values({
    userId: existingUser.id,
    loginTime: new Date(),
  });
  return {
    user: {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role,
      status: existingUser.status,
      firstTimeLogin,
      lastLogin,
      facultyId: existingUser.facultyId,
      facultyName: existingUser.facultyName,
    },
    token,
  };
}

export async function getMostActiveUsers(role?: Role) {
  if (role) {
    return db
      .select({
        id: user.id,
        email: user.email,
        status: user.status,
        totalLogins: user.totalLogins,
        name: user.name,
        facultyId: user.facultyId,
        role: user.role,
      })
      .from(user)
      .where(and(eq(user.role, role), gt(user.totalLogins, 0)))
      .orderBy(desc(user.totalLogins))
      .limit(5);
  }

  return db
    .select({
      id: user.id,
      email: user.email,
      status: user.status,
      totalLogins: user.totalLogins,
      name: user.name,
      facultyId: user.facultyId,
      role: user.role,
    })
    .from(user)
    .where(gt(user.totalLogins, 0))
    .orderBy(desc(user.totalLogins))
    .limit(5);
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
