import { eq, and, sql, desc, aliasedTable } from 'drizzle-orm';

import {
  user,
  contribution,
  academicYear,
  contributionAsset,
} from '../../db/schema';
import { db } from '../../db';

import {
  encodeToken,
  PaginationParams,
  PaginatedResponse,
  getPaginationParams,
  createPaginationQuery,
} from '../../utils/pagination';
import { logger } from '../../utils/logger';
import { ValidationError } from '../../utils/errors';
import { generatePresignedDownloadUrl } from '../../utils/s3';
import { sendEmail, newContributionEmailTemplate } from '../../utils/email';

type contributionAssetType = {
  contributionId: string;
  type: 'article' | 'image';
  filePath: string;
};

export async function createContribution(
  student: Partial<typeof user.$inferSelect>,
  data: {
    title: string;
    description: string;
    article: { path: string };
    images?: { path: string }[];
  },
): Promise<
  typeof contribution.$inferSelect & {
    assets: (typeof contributionAsset.$inferSelect)[];
  }
> {
  const now = new Date();

  const [marketingCoordinator] = await db
    .select({ name: user.name, email: user.email })
    .from(user)
    .where(
      and(
        eq(user.facultyId, student.facultyId!),
        eq(user.role, 'marketing_coordinator'),
      ),
    )
    .limit(1);

  if (!marketingCoordinator) {
    throw new ValidationError(
      'There is no marketing coordinator for this faculty',
    );
  }

  // Find current academic year based on submission date
  // Another approach is to allow students pick their desired academic year
  const academicYearData = await db
    .select()
    .from(academicYear)
    .where(
      and(
        sql`${now} >= ${academicYear.startDate}`,
        sql`${now} <= ${academicYear.newClosureDate}`,
      ),
    )
    .orderBy(desc(academicYear.startDate))
    .limit(1);

  if (academicYearData.length === 0) {
    throw new ValidationError('No active academic year found for submissions');
  }

  if (now > academicYearData[0].newClosureDate) {
    throw new ValidationError(
      `New submissions are no longer accepted after ${academicYearData[0].newClosureDate.toISOString()}`,
    );
  }

  // Create contribution
  const [newContribution] = await db
    .insert(contribution)
    .values({
      title: data.title,
      description: data.description,
      studentId: student.id!,
      facultyId: student.facultyId!,
      academicYearId: academicYearData[0].id,
      submissionDate: now,
    })
    .returning();

  // Create article asset
  await db.insert(contributionAsset).values({
    contributionId: newContribution.id,
    type: 'article',
    filePath: data.article.path,
  });

  // Create image assets
  const imageAssets: contributionAssetType[] = (data.images ?? []).map(
    (image) => ({
      contributionId: newContribution.id,
      type: 'image',
      filePath: image.path,
    }),
  );

  if (imageAssets.length > 0) {
    await db.insert(contributionAsset).values(imageAssets);
  }

  const emailData = {
    title: data.title,
    newContributionId: newContribution.id,
    student: {
      name: student.name!,
      email: student.email!,
    },
    marketingCoordinator: {
      name: marketingCoordinator.name,
    },
  };

  // Send email notification to faculty's marketing coordinator
  const result = await sendEmail({
    to: marketingCoordinator.email,
    subject: '🎉 New Contribution Submission',
    html: newContributionEmailTemplate(emailData),
  });

  if (result.success === false) {
    logger.error(`Error sending email: ${result.error}`);
  }

  const assets = await db
    .select()
    .from(contributionAsset)
    .where(eq(contributionAsset.contributionId, newContribution.id));

  const assetsWithUrls = await Promise.all(
    assets.map(async (asset) => ({
      ...asset,
      url: await generatePresignedDownloadUrl('ewsd-bucket', asset.filePath),
    })),
  );

  return {
    ...newContribution,
    assets: assetsWithUrls,
  };
}

export async function getContribution(
  contributionId: string,
  studentId: string,
): Promise<{
  success: boolean;
  data:
    | (typeof contribution.$inferSelect & {
        assets: (typeof contributionAsset.$inferSelect)[];
      })
    | [];
}> {
  const contributionData = await db
    .select()
    .from(contribution)
    .where(
      and(
        eq(contribution.id, contributionId),
        eq(contribution.studentId, studentId),
      ),
    )
    .limit(1);

  if (contributionData.length === 0) {
    return {
      success: true,
      data: [],
    };
  }

  const assets = await db
    .select()
    .from(contributionAsset)
    .where(eq(contributionAsset.contributionId, contributionId));

  // Generate presigned URLs for each asset
  const assetsWithUrls = await Promise.all(
    assets.map(async (asset) => ({
      ...asset,
      url: await generatePresignedDownloadUrl('ewsd-bucket', asset.filePath),
    })),
  );

  return {
    success: true,
    data: {
      ...contributionData[0],
      assets: assetsWithUrls,
    },
  };
}

export async function updateContribution(
  contributionId: string,
  student: Partial<typeof user.$inferSelect>,
  data: {
    title: string;
    description: string;
    article: { path: string };
    images?: { path: string }[];
  },
): Promise<void> {
  // Check if contribution exists and belongs to student
  const contributionData = await db
    .select()
    .from(contribution)
    .where(
      and(
        eq(contribution.id, contributionId),
        eq(contribution.studentId, student.id!),
      ),
    )
    .limit(1);

  if (contributionData.length === 0) {
    throw new ValidationError('Contribution not found');
  }

  // Check if academic year still accepts updates
  const academicYearData = await db
    .select()
    .from(academicYear)
    .where(eq(academicYear.id, contributionData[0].academicYearId))
    .limit(1);

  const now = new Date();
  if (now > academicYearData[0].finalClosureDate) {
    throw new ValidationError('Updates are no longer accepted');
  }

  // Update contribution
  await db
    .update(contribution)
    .set({
      title: data.title,
      description: data.description,
      updatedAt: now,
    })
    .where(eq(contribution.id, contributionId));

  // Update article
  await db
    .update(contributionAsset)
    .set({ filePath: data.article.path, updatedAt: now })
    .where(
      and(
        eq(contributionAsset.contributionId, contributionId),
        eq(contributionAsset.type, 'article'),
      ),
    );

  // Delete existing images
  await db
    .delete(contributionAsset)
    .where(
      and(
        eq(contributionAsset.contributionId, contributionId),
        eq(contributionAsset.type, 'image'),
      ),
    );

  // Insert new images
  if ((data.images ?? []).length > 0) {
    await db.insert(contributionAsset).values(
      (data.images ?? []).map((image) => ({
        contributionId,
        type: 'image',
        filePath: image.path,
      })) as contributionAssetType[],
    );
  }
}

export async function listMyContributions(
  studentId: string,
  params: PaginationParams,
): Promise<PaginatedResponse<typeof contribution.$inferSelect>> {
  const { limit = 20, cursor, order } = getPaginationParams(params);

  if (limit > 20) {
    throw new ValidationError('Limit must be less than or equal to 20');
  }

  const items = await db
    .select()
    .from(contribution)
    .where(
      and(
        eq(contribution.studentId, studentId),
        createPaginationQuery(sql`${contribution.createdAt}`, {
          cursor,
          order,
        }),
      ),
    )
    .orderBy(sql`${contribution.createdAt} ${sql.raw(order)}`)
    .limit(limit + 1);

  // Fetch assets for each contribution
  const itemsWithAssets = await Promise.all(
    items.map(async (item) => {
      const assets = await db
        .select()
        .from(contributionAsset)
        .where(eq(contributionAsset.contributionId, item.id));

      const assetsWithUrls = await Promise.all(
        assets.map(async (asset) => ({
          ...asset,
          url: await generatePresignedDownloadUrl(
            'ewsd-bucket',
            asset.filePath,
          ),
        })),
      );

      return { ...item, assets: assetsWithUrls };
    }),
  );

  if (itemsWithAssets.length === 0) return { items: [], nextCursor: null };

  const hasMore = itemsWithAssets.length > limit;

  // if desc pop first before cursor extraction
  if (order === 'desc' && hasMore) itemsWithAssets.pop();

  const nextCursor = hasMore
    ? itemsWithAssets[itemsWithAssets.length - 1].createdAt!.toISOString()
    : null;

  // if asc pop after cursor extraction
  if (order === 'asc' && hasMore) items.pop();

  return {
    items: itemsWithAssets,
    nextCursor: nextCursor ? encodeToken(nextCursor) : nextCursor,
  };
}

export async function listFacultySelectedContributions(
  facultyId: string,
  params: PaginationParams,
): Promise<
  PaginatedResponse<{
    studentId: string;
    studentName: string;
    email: string;
    contribution: typeof contribution.$inferSelect;
  }>
> {
  const { limit = 20, cursor, order } = getPaginationParams(params);

  if (limit > 20) {
    throw new ValidationError('Limit must be less than or equal to 20');
  }

  const student = aliasedTable(user, 'student');

  const items = await db
    .select({
      studentId: student.id,
      studentName: student.name,
      email: student.email,
      contribution: contribution,
    })
    .from(contribution)
    .innerJoin(student, eq(student.id, contribution.studentId))
    .where(
      and(
        eq(contribution.facultyId, facultyId),
        eq(contribution.status, 'selected'),
        createPaginationQuery(sql`${contribution.createdAt}`, {
          cursor,
          order,
        }),
      ),
    )
    .orderBy(sql`${contribution.createdAt} ${sql.raw(order)}`)
    .limit(limit + 1);

  // Fetch assets for each contribution
  const itemsWithAssets = await Promise.all(
    items.map(async (item) => {
      const assets = await db
        .select()
        .from(contributionAsset)
        .where(eq(contributionAsset.contributionId, item.contribution.id));

      // Generate presigned URLs for each asset
      const assetsWithUrls = await Promise.all(
        assets.map(async (asset) => ({
          ...asset,
          url: await generatePresignedDownloadUrl(
            'ewsd-bucket',
            asset.filePath,
          ),
        })),
      );

      return {
        ...item,
        contribution: {
          ...item.contribution,
          assets: assetsWithUrls,
        },
      };
    }),
  );

  if (itemsWithAssets.length === 0) return { items: [], nextCursor: null };

  const hasMore = itemsWithAssets.length > limit;

  // if desc pop first before cursor extraction
  if (order === 'desc' && hasMore) itemsWithAssets.pop();

  const nextCursor = hasMore
    ? itemsWithAssets[
        itemsWithAssets.length - 1
      ].contribution.createdAt!.toISOString()
    : null;

  // if asc pop after cursor extraction
  if (order === 'asc' && hasMore) itemsWithAssets.pop();

  return {
    items: itemsWithAssets,
    nextCursor: nextCursor ? encodeToken(nextCursor) : nextCursor,
  };
}
