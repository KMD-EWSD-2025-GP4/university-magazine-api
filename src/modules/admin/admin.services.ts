import bcrypt from 'bcryptjs';
import { db } from '../../db';
import { academicYear, faculty, term, user } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { Role } from '../../types/roles';
import { logger } from '../../utils/logger';
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
  await db.insert(faculty).values({ name: facultyName });
}

export async function deleteFaculty(facultyId: string) {
  await db.delete(faculty).where(eq(faculty.id, facultyId));
}

export async function updateFaculty(facultyId: string, facultyName: string) {
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
  await db.delete(academicYear).where(eq(academicYear.id, academicYearId));
}

export async function updateAcademicYear(
  academicYearId: string,
  startDate: Date,
  endDate: Date,
  newClosureDate: Date,
  finalClosureDate: Date,
) {
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
  await db.delete(term).where(eq(term.id, termId));
}

export async function updateTerm(
  termId: string,
  name: string,
  content: string,
) {
  await db.update(term).set({ name, content }).where(eq(term.id, termId));
}
