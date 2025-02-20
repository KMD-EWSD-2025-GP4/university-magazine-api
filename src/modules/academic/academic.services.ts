import { db } from '../../db';
import { academicYear, faculty, term } from '../../db/schema';
import { eq, or } from 'drizzle-orm';
import { logger } from '../../utils/logger';

export async function getAllFaculties() {
  return await db.select().from(faculty);
}

export async function getAcademicYears() {
  return await db.select().from(academicYear);
}

export async function getAcademicYearById(academicYearId: string) {
  return await db
    .select()
    .from(academicYear)
    .where(eq(academicYear.id, academicYearId));
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
  return await db.select().from(term).where(eq(term.id, termId));
}
