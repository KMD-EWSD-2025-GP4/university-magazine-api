import { eq, sql, desc } from 'drizzle-orm';

import { db } from '../../db';
import { faculty, contribution, academicYear } from '../../db/schema';

export async function marketingManagerContributionsReport(): Promise<{
  academicYears: {
    id: string;
    year: string;
    faculties: {
      id: string;
      name: string;
      contributionCount: number;
    }[];
    totalContributions: number;
  }[];
  totalContributions: number;
}> {
  // Get all selected contributions grouped by academic year and faculty
  const contributionCountByFaculty = await db
    .select({
      academicYearId: academicYear.id,
      academicYearStart: academicYear.startDate,
      academicYearEnd: academicYear.endDate,
      facultyId: faculty.id,
      facultyName: faculty.name,
      count: sql<number>`count(${contribution.id})::int`,
    })
    .from(contribution)
    .innerJoin(faculty, eq(contribution.facultyId, faculty.id))
    .innerJoin(academicYear, eq(contribution.academicYearId, academicYear.id))
    .where(eq(contribution.status, 'selected'))
    .groupBy(
      academicYear.id,
      academicYear.startDate,
      academicYear.endDate,
      faculty.id,
      faculty.name,
    )
    .orderBy(desc(academicYear.startDate), faculty.name);

  // Organize data by academic year
  const academicYearsMap = new Map<
    string,
    {
      id: string;
      year: string;
      startDate: Date;
      faculties: Map<
        string,
        { id: string; name: string; contributionCount: number }
      >;
      totalContributions: number;
    }
  >();

  let totalContributions = 0;

  // Process query results and organize by academic year and faculty
  for (const row of contributionCountByFaculty) {
    totalContributions += row.count;

    // Format academic year as "YYYY-YYYY"
    const startYear = new Date(row.academicYearStart).getFullYear();
    const endYear = new Date(row.academicYearEnd).getFullYear();
    const academicYearString =
      startYear === endYear
        ? `${startYear}-${endYear + 1}`
        : `${startYear}-${endYear}`;

    // Get or create academic year entry
    if (!academicYearsMap.has(row.academicYearId)) {
      academicYearsMap.set(row.academicYearId, {
        id: row.academicYearId,
        year: academicYearString,
        startDate: row.academicYearStart,
        faculties: new Map(),
        totalContributions: 0,
      });
    }

    // Get academic year entry and update it
    const academicYearEntry = academicYearsMap.get(row.academicYearId)!;
    academicYearEntry.totalContributions += row.count;

    // Add faculty data
    academicYearEntry.faculties.set(row.facultyId, {
      id: row.facultyId,
      name: row.facultyName,
      contributionCount: row.count,
    });
  }

  // Convert the maps to arrays for the final response
  const academicYears = Array.from(academicYearsMap.values())
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime()) // Sort by startDate descending
    .map((yearData) => ({
      id: yearData.id,
      year: yearData.year,
      faculties: Array.from(yearData.faculties.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      totalContributions: yearData.totalContributions,
    }));

  return {
    academicYears,
    totalContributions,
  };
}

export async function marketingManagerContributorsReport(): Promise<{
  academicYears: {
    id: string;
    year: string;
    faculties: {
      id: string;
      name: string;
      uniqueContributorsCount: number;
    }[];
    totalUniqueContributors: number;
  }[];
  totalUniqueContributors: number;
}> {
  // Get unique contributors (students) grouped by academic year and faculty
  const uniqueContributorsByFaculty = await db
    .select({
      academicYearId: academicYear.id,
      academicYearStart: academicYear.startDate,
      academicYearEnd: academicYear.endDate,
      facultyId: faculty.id,
      facultyName: faculty.name,
      count: sql<number>`count(DISTINCT ${contribution.studentId})::int`,
    })
    .from(contribution)
    .innerJoin(faculty, eq(contribution.facultyId, faculty.id))
    .innerJoin(academicYear, eq(contribution.academicYearId, academicYear.id))
    .where(eq(contribution.status, 'selected'))
    .groupBy(
      academicYear.id,
      academicYear.startDate,
      academicYear.endDate,
      faculty.id,
      faculty.name,
    )
    .orderBy(desc(academicYear.startDate), faculty.name);

  // Organize data by academic year
  const academicYearsMap = new Map<
    string,
    {
      id: string;
      year: string;
      startDate: Date;
      faculties: Map<
        string,
        { id: string; name: string; uniqueContributorsCount: number }
      >;
      totalUniqueContributors: number;
    }
  >();

  // Process query results and organize by academic year and faculty
  for (const row of uniqueContributorsByFaculty) {
    // Format academic year as "YYYY-YYYY"
    const startYear = new Date(row.academicYearStart).getFullYear();
    const endYear = new Date(row.academicYearEnd).getFullYear();
    // if endYear is equal to startYear, add 1 to endYear
    // to avoid having the same year twice
    const academicYearString =
      startYear === endYear
        ? `${startYear}-${endYear + 1}`
        : `${startYear}-${endYear}`;

    // Get or create academic year entry
    if (!academicYearsMap.has(row.academicYearId)) {
      academicYearsMap.set(row.academicYearId, {
        id: row.academicYearId,
        year: academicYearString,
        startDate: row.academicYearStart,
        faculties: new Map(),
        totalUniqueContributors: 0,
      });
    }

    // Add faculty data
    const academicYearEntry = academicYearsMap.get(row.academicYearId)!;
    academicYearEntry.faculties.set(row.facultyId, {
      id: row.facultyId,
      name: row.facultyName,
      uniqueContributorsCount: row.count,
    });
  }

  // Now calculate total unique contributors for each academic year
  // We need to do an additional query to get the total unique contributors per academic year
  // because simply summing the faculty counts would double-count students who contributed to multiple faculties
  const uniqueContributorsByYear = await db
    .select({
      academicYearId: academicYear.id,
      count: sql<number>`count(DISTINCT ${contribution.studentId})::int`,
    })
    .from(contribution)
    .innerJoin(academicYear, eq(contribution.academicYearId, academicYear.id))
    .where(eq(contribution.status, 'selected'))
    .groupBy(academicYear.id)
    .orderBy(academicYear.id);

  // Update the totals for each academic year
  for (const row of uniqueContributorsByYear) {
    if (academicYearsMap.has(row.academicYearId)) {
      academicYearsMap.get(row.academicYearId)!.totalUniqueContributors =
        row.count;
    }
  }

  // Get total unique contributors across all academic years
  const [{ count: totalUniqueContributors }] = await db
    .select({
      count: sql<number>`count(DISTINCT ${contribution.studentId})::int`,
    })
    .from(contribution)
    .where(eq(contribution.status, 'selected'));

  // Convert the maps to arrays for the final response
  const academicYears = Array.from(academicYearsMap.values())
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime()) // Sort by startDate descending
    .map((yearData) => ({
      id: yearData.id,
      year: yearData.year,
      faculties: Array.from(yearData.faculties.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      totalUniqueContributors: yearData.totalUniqueContributors,
    }));

  return {
    academicYears,
    totalUniqueContributors,
  };
}
