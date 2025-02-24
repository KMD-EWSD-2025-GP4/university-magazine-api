import { db } from '../../db';
import { academicYear, faculty, term } from '../../db/schema';
import { eq, or } from 'drizzle-orm';
import { logger } from '../../utils/logger';
import { ValidationError } from '../../utils/errors';
import { DatabaseError } from 'pg';

export async function getAllFaculties() {
  return await db.select().from(faculty);
}

export async function getAcademicYears() {
  return await db.select().from(academicYear);
}

export async function getAcademicYearById(academicYearId: string) {
  try {
    return await db
      .select()
      .from(academicYear)
      .where(eq(academicYear.id, academicYearId));
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid academic year id');
    }
    throw error;
  }
}

export async function getAcademicYearByDate(date: Date) {
  return await db
    .select()
    .from(academicYear)
    .where(
      or(eq(academicYear.startDate, date), eq(academicYear.endDate, date)),
    );
}

export async function getTerms() {
  return await db.select().from(term);
}

export async function getTermById(termId: string) {
  try {
    return await db.select().from(term).where(eq(term.id, termId));
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '22P02') {
      throw new ValidationError('Invalid term id');
    }
    throw error;
  }
}
