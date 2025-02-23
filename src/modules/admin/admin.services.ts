import bcrypt from 'bcryptjs';
import { db } from '../../db';
import { academicYear, faculty, term, user } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { Role } from '../../types/roles';
import { logger } from '../../utils/logger';
import { V } from 'vitest/dist/chunks/reporters.nr4dxCkA';
import { ValidationError } from '../../utils/errors';
import { DatabaseError } from 'pg';

export async function createUser(
  email: string,
  password: string,
  role: Role,
  firstName: string,
  lastName: string,
  facultyId: string,
) {
  // check if user already exists
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (existingUser.length > 0) {
    throw new ValidationError('User already exists');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.insert(user).values({
    email,
    passwordHash: hashedPassword,
    role,
    firstName,
    lastName,
    facultyId,
  });
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db
    .update(user)
    .set({ passwordHash: hashedPassword })
    .where(eq(user.id, userId));
}

export async function changeUserRole(userId: string, newRole: Role) {
  await db.update(user).set({ role: newRole }).where(eq(user.id, userId));
}

export async function changeUserFaculty(userId: string, newFacultyId: string) {
  await db
    .update(user)
    .set({ facultyId: newFacultyId })
    .where(eq(user.id, userId));
}

export async function createFaculty(facultyName: string) {
  try {
    await db.insert(faculty).values({ name: facultyName });
  } catch (error) {
    logger.error(error);
    if (error instanceof DatabaseError && error.code === '23505') {
      throw new ValidationError('Faculty already exists');
    }
    throw error;
  }
}

export async function deleteFaculty(facultyId: string) {
  await db.delete(faculty).where(eq(faculty.id, facultyId));
}

export async function updateFaculty(facultyId: string, facultyName: string) {
  // check if faculty already exists or not
  const existingFaculty = await db
    .select()
    .from(faculty)
    .where(eq(faculty.id, facultyId))
    .limit(1);
  if (existingFaculty.length === 0) {
    throw new ValidationError('Faculty does not exist');
  }
  await db
    .update(faculty)
    .set({ name: facultyName })
    .where(eq(faculty.id, facultyId));
}

export async function createAcademicYear(
  startDate: Date,
  endDate: Date,
  newClosureDate: Date,
  finalClosureDate: Date,
) {
  const convertedStartDate = new Date(startDate);
  const convertedEndDate = new Date(endDate);
  const convertedNewClosureDate = new Date(newClosureDate);
  const convertedFinalClosureDate = new Date(finalClosureDate);
  await db.insert(academicYear).values({
    startDate: convertedStartDate,
    endDate: convertedEndDate,
    newClosureDate: convertedNewClosureDate,
    finalClosureDate: convertedFinalClosureDate,
  });
}

export async function deleteAcademicYear(academicYearId: string) {
  // check if academic year exists or not
  const existingAcademicYear = await db
    .select()
    .from(academicYear)
    .where(eq(academicYear.id, academicYearId))
    .limit(1);
  if (existingAcademicYear.length === 0) {
    throw new ValidationError('Academic year does not exist');
  }
  await db.delete(academicYear).where(eq(academicYear.id, academicYearId));
}

export async function updateAcademicYear(
  academicYearId: string,
  startDate: Date,
  endDate: Date,
  newClosureDate: Date,
  finalClosureDate: Date,
) {
  // check if academic year exists or not
  const existingAcademicYear = await db
    .select()
    .from(academicYear)
    .where(eq(academicYear.id, academicYearId))
    .limit(1);
  if (existingAcademicYear.length === 0) {
    throw new ValidationError('Academic year does not exist');
  }
  const convertedStartDate = new Date(startDate);
  const convertedEndDate = new Date(endDate);
  const convertedNewClosureDate = new Date(newClosureDate);
  const convertedFinalClosureDate = new Date(finalClosureDate);
  await db
    .update(academicYear)
    .set({
      startDate: convertedStartDate,
      endDate: convertedEndDate,
      newClosureDate: convertedNewClosureDate,
      finalClosureDate: convertedFinalClosureDate,
    })
    .where(eq(academicYear.id, academicYearId));
}

export async function createTerm(name: string, content: string) {
  await db.insert(term).values({ name, content });
}

export async function deleteTerm(termId: string) {
  // check if term exists or not
  const existingTerm = await db
    .select()
    .from(term)
    .where(eq(term.id, termId))
    .limit(1);
  if (existingTerm.length === 0) {
    throw new ValidationError('Term does not exist');
  }
  await db.delete(term).where(eq(term.id, termId));
}

export async function updateTerm(
  termId: string,
  name: string,
  content: string,
) {
  // check if term exists or not
  const existingTerm = await db
    .select()
    .from(term)
    .where(eq(term.id, termId))
    .limit(1);
  if (existingTerm.length === 0) {
    throw new ValidationError('Term does not exist');
  }
  await db.update(term).set({ name, content }).where(eq(term.id, termId));
}
