import bcrypt from 'bcryptjs';
import { db } from '../../db';
import {
  academicYear,
  contribution,
  faculty,
  term,
  user,
} from '../../db/schema';
import { eq } from 'drizzle-orm';
import { Role } from '../../types/roles';
import { logger } from '../../utils/logger';
import { ValidationError } from '../../utils/errors';
import { DatabaseError } from 'pg';

export async function createUser(
  email: string,
  password: string,
  role: Role,
  name: string,
  facultyId: string,
) {
  // check if user already exists
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(user).values({
      email,
      passwordHash: hashedPassword,
      role,
      name,
      facultyId,
    });
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '23505') {
      throw new ValidationError('User already exists');
    }
    if (error instanceof DatabaseError && error.code === '23503') {
      throw new ValidationError('Faculty does not exist');
    }
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid faculty id');
    }
    throw error;
  }
}

export async function updateUser(
  userId: string,
  password: string | undefined,
  role: Role,
  facultyId: string,
  status: 'active' | 'inactive',
) {
  try {
    // check if password is provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db
        .update(user)
        .set({ passwordHash: hashedPassword, role, facultyId, status })
        .where(eq(user.id, userId));
    } else {
      await db
        .update(user)
        .set({ role, facultyId, status })
        .where(eq(user.id, userId));
    }
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid user id');
    }
    if (error instanceof DatabaseError && error.code === '23503') {
      throw new ValidationError('Faculty or user does not exist');
    }
    throw error;
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  try {
    await db
      .update(user)
      .set({ passwordHash: hashedPassword })
      .where(eq(user.id, userId));
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid user id');
    }
    throw error;
  }
}

export async function changeUserRole(userId: string, newRole: Role) {
  try {
    await db.update(user).set({ role: newRole }).where(eq(user.id, userId));
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid user id');
    }
    throw error;
  }
}

export async function changeUserFaculty(userId: string, newFacultyId: string) {
  try {
    await db
      .update(user)
      .set({ facultyId: newFacultyId })
      .where(eq(user.id, userId));
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid user id');
    }
    throw error;
  }
}

export async function changeUserStatus(
  userId: string,
  status: 'active' | 'inactive',
) {
  try {
    await db.update(user).set({ status }).where(eq(user.id, userId));
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid user id');
    }
    throw error;
  }
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
  try {
    // prevent deleting faculty if it has users
    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.facultyId, facultyId));
    if (existingUsers.length > 0) {
      throw new ValidationError('Faculty has existing users');
    }
    await db.delete(faculty).where(eq(faculty.id, facultyId));
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid faculty id');
    }
    throw error;
  }
}

export async function updateFaculty(
  facultyId: string,
  facultyName: string,
  status: 'active' | 'inactive',
) {
  try {
    // check if faculty already exists or not
    const existingFaculty = await db
      .select()
      .from(faculty)
      .where(eq(faculty.id, facultyId));
    if (!existingFaculty || existingFaculty.length === 0) {
      throw new ValidationError('Faculty does not exist');
    }

    // prevent updating faculty status to inactive if it has users
    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.facultyId, facultyId));
    if (existingUsers.length > 0 && status === 'inactive') {
      throw new ValidationError('Faculty has existing users');
    }
    await db
      .update(faculty)
      .set({ name: facultyName, status })
      .where(eq(faculty.id, facultyId));
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid faculty id');
    }
    throw error;
  }
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
  try {
    // check if academic year exists or not
    const existingAcademicYear = await db
      .select()
      .from(academicYear)
      .where(eq(academicYear.id, academicYearId))
      .limit(1);
    if (existingAcademicYear.length === 0) {
      throw new ValidationError('Academic year does not exist');
    }
    // prevent deleting academic year if it has contributions
    const existingContributions = await db
      .select()
      .from(contribution)
      .where(eq(contribution.academicYearId, academicYearId));
    if (existingContributions.length > 0) {
      throw new ValidationError('Academic year has existing contributions');
    }
    await db.delete(academicYear).where(eq(academicYear.id, academicYearId));
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid academic year id');
    }
    throw error;
  }
}

export async function updateAcademicYear(
  academicYearId: string,
  startDate: Date,
  endDate: Date,
  newClosureDate: Date,
  finalClosureDate: Date,
  status: 'active' | 'inactive',
) {
  try {
    // check if academic year exists or not
    const existingAcademicYear = await db
      .select()
      .from(academicYear)
      .where(eq(academicYear.id, academicYearId))
      .limit(1);
    if (existingAcademicYear.length === 0) {
      throw new ValidationError('Academic year does not exist');
    }

    // prevent updating academic year status to inactive if it has contributions
    const existingContributions = await db
      .select()
      .from(contribution)
      .where(eq(contribution.academicYearId, academicYearId));
    if (existingContributions.length > 0 && status === 'inactive') {
      throw new ValidationError('Academic year has existing contributions');
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
        status,
      })
      .where(eq(academicYear.id, academicYearId));
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid academic year id');
    }
    throw error;
  }
}

export async function createTerm(name: string, content: string) {
  try {
    await db.insert(term).values({ name, content });
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '23505') {
      throw new ValidationError('Term already exists');
    }
    throw error;
  }
}

export async function deleteTerm(termId: string) {
  try {
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
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid term id');
    }
    throw error;
  }
}

export async function updateTerm(
  termId: string,
  name: string,
  content: string,
) {
  try {
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
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid term id');
    }
    throw error;
  }
}
