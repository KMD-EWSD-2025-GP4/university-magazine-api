import { eq, sql, asc, desc, and, isNull, SQL } from 'drizzle-orm';

import {
  user,
  comment,
  faculty,
  contribution,
  academicYear,
} from '../../db/schema';
import { db } from '../../db';
import { formatAcademicYearString } from '../../utils/formatters';

export async function getGuestListByFaculty(facultyId: string) {
  return await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      lastLogin: user.lastLogin,
      browser: user.browser,
      totalLogins: user.totalLogins,
      status: user.status,
      facultyName: sql<string>`(SELECT name FROM faculties WHERE id = ${facultyId})`,
    })
    .from(user)
    .where(
      and(
        eq(user.facultyId, facultyId),
        eq(user.role, 'guest'),
        eq(user.status, 'active'),
      ),
    )
    .orderBy(desc(user.lastLogin));
}

export async function getContributorsAndContributions(
  facultyId: string,
  academicYearId?: string,
) {
  let whereConditions = eq(contribution.facultyId, facultyId);

  if (academicYearId) {
    whereConditions = and(
      eq(contribution.academicYearId, academicYearId),
      eq(contribution.facultyId, facultyId),
    ) as SQL;
  }

  const [result] = await db
    .select({
      totalContributions: sql<number>`count(${contribution.id})::int`,
      uniqueContributors: sql<number>`count(distinct ${contribution.studentId})::int`,
      facultyName: sql<string>`(SELECT name FROM faculties WHERE id = ${facultyId})`,
    })
    .from(contribution)
    .where(whereConditions);

  return result;
}

export async function getYearlyStats(facultyId: string) {
  const stats = await db
    .select({
      academicYear,
      contributions: sql<number>`count(${contribution.id})::int`,
      contributors: sql<number>`count(distinct ${contribution.studentId})::int`,
    })
    .from(contribution)
    .innerJoin(academicYear, eq(contribution.academicYearId, academicYear.id))
    .where(
      and(
        eq(contribution.facultyId, facultyId),
        sql`${academicYear.startDate} >= NOW() - INTERVAL '6 years'`,
      ),
    )
    .groupBy(academicYear.id)
    .orderBy(desc(academicYear.startDate));

  return {
    data: stats.map((stat) => ({
      academicYear: formatAcademicYearString(
        new Date(stat.academicYear.startDate),
        new Date(stat.academicYear.endDate),
      ),
      contributors: stat.contributors,
      contributions: stat.contributions,
    })),
  };
}

export async function getUncommentedContributions(
  facultyId: string,
  academicYearId?: string,
) {
  // If no academicYearId provided, get the last academic year
  if (!academicYearId) {
    const [lastAcademicYear] = await db
      .select()
      .from(academicYear)
      .orderBy(desc(academicYear.endDate))
      .limit(1);
    academicYearId = lastAcademicYear.id;
  }

  const items = await db
    .select()
    .from(contribution)
    .leftJoin(comment, eq(contribution.id, comment.contributionId))
    .where(
      and(
        eq(contribution.status, 'pending'),
        eq(contribution.facultyId, facultyId),
        eq(contribution.academicYearId, academicYearId),
        isNull(comment.id),
      ),
    )
    .orderBy(asc(contribution.submissionDate));

  console.log(items);

  const itemsWithDetails = await Promise.all(
    items.map(async (item) => {
      const [student] = await db
        .select({ name: user.name })
        .from(user)
        .where(eq(user.id, item.contributions.studentId))
        .limit(1);

      const [year] = await db
        .select({
          startDate: academicYear.startDate,
          endDate: academicYear.endDate,
        })
        .from(academicYear)
        .where(eq(academicYear.id, item.contributions.academicYearId))
        .limit(1);

      const [{ name: facultyName }] = await db
        .select({ name: faculty.name })
        .from(faculty)
        .where(eq(faculty.id, item.contributions.facultyId))
        .limit(1);

      const academicYearString = formatAcademicYearString(
        new Date(year.startDate),
        new Date(year.endDate),
      );

      const createdAt = new Date(item.contributions.createdAt!);
      const dueDate = new Date(createdAt);
      dueDate.setDate(createdAt.getDate() + 14);

      const result = {
        ...item.contributions,
        studentName: student.name,
        academicYear: academicYearString,
        facultyName,
        dueDate,
      };

      return result;
    }),
  );

  return {
    items: itemsWithDetails.map((item) => ({
      ...item,
      isMoreThan14DaysOverdue: new Date() > new Date(item.dueDate),
    })),
    totalContributionsWithoutComment: itemsWithDetails.length,
    totalContributionsWithoutCommentForMoreThan14Days: itemsWithDetails.filter(
      (item) => new Date() > new Date(item.dueDate),
    ).length,
  };
}
