import { eq, and, sql, desc, aliasedTable } from 'drizzle-orm';

import {
  user,
  comment,
  contribution,
  academicYear,
  contributionAsset,
} from '../../db/schema';
import { db } from '../../db';

import {
  sendEmail,
  newCommentEmailTemplate,
  newContributionEmailTemplate,
  updateContributionStatusEmailTemplate,
} from '../../utils/email';
import {
  encodeToken,
  PaginationParams,
  PaginatedResponse,
  getPaginationParams,
  createPaginationQuery,
} from '../../utils/pagination';
import { logger } from '../../utils/logger';
import { generatePresignedDownloadUrl } from '../../utils/s3';
import { ValidationError, ForbiddenError } from '../../utils/errors';

type contributionAssetType = {
  contributionId: string;
  type: 'article' | 'image';
  filePath: string;
};

type commentType = { by: string; content: string; createdAt: Date | null };

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
        sql`${now} <= ${academicYear.endDate}`,
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
  currentUser: Partial<typeof user.$inferSelect>,
): Promise<{
  success: boolean;
  data:
    | (typeof contribution.$inferSelect & {
        assets: (typeof contributionAsset.$inferSelect)[];
        comments: commentType[] | [];
      })
    | [];
}> {
  const contributionData = await db
    .select()
    .from(contribution)
    .where(
      eq(contribution.id, contributionId),
      // and(
      //   eq(contribution.id, contributionId),
      //   eq(contribution.studentId, studentId),
      // ),
    )
    .limit(1);

  if (contributionData.length === 0) {
    return {
      success: true,
      data: [],
    };
  }

  // logic for additional roles can be added here

  // Check access permissions for guest/student roles
  // A guest cannot view contribution that is not selected and not under their faculty
  // A student cannot view contribution that is not theirs and is not selected
  if (
    currentUser.role === 'student' &&
    currentUser.id !== contributionData[0].studentId
  ) {
    if (contributionData[0].status !== 'selected') {
      throw new ForbiddenError(
        'You do not have enough permission to view this contribution',
      );
    }
  }

  if (currentUser.role === 'guest') {
    if (
      contributionData[0].status !== 'selected' ||
      currentUser.facultyId !== contributionData[0].facultyId
    ) {
      throw new ForbiddenError(
        'You do not have enough permission to view this contribution',
      );
    }
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

  let comments: commentType[] = [];
  // return comment for the contribution if role is marketing coordinator or student is owner
  if (
    currentUser.role === 'marketing_coordinator' ||
    currentUser.id === contributionData[0].studentId
  ) {
    const coordinator = aliasedTable(user, 'marketingCoordinator');

    comments = await db
      .select({
        by: coordinator.name,
        content: comment.content,
        createdAt: comment.createdAt,
      })
      .from(comment)
      .innerJoin(coordinator, eq(coordinator.id, comment.userId))
      .where(eq(comment.contributionId, contributionId));
  }

  return {
    success: true,
    data: {
      ...contributionData[0],
      assets: assetsWithUrls,
      comments,
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

export async function createComment(
  contributionId: string,
  currentUser: Partial<typeof user.$inferSelect>,
  data: { comment: string },
): Promise<{ success: boolean; comment: string }> {
  // Check if contribution exists
  const contributionData = await db
    .select()
    .from(contribution)
    .where(eq(contribution.id, contributionId))
    .limit(1);

  if (contributionData.length === 0)
    throw new ValidationError('Contribution not found');

  // add comment
  const [newComment] = await db
    .insert(comment)
    .values({
      contributionId,
      content: data.comment,
      userId: currentUser.id!,
    })
    .returning();

  if (newComment) {
    // send email to student
    const [student] = await db
      .select()
      .from(user)
      .where(eq(user.id, contributionData[0].studentId))
      .limit(1);

    if (student) {
      const emailData = {
        title: contributionData[0].title,
        contributionId: contributionData[0].id,
        student: {
          name: student.name!,
          email: student.email!,
        },
        marketingCoordinator: {
          name: currentUser.name!,
        },
      };
      // Send email notification to faculty's marketing coordinator
      const result = await sendEmail({
        to: student.email,
        subject: '🎉 New Comment on your Contribution',
        html: newCommentEmailTemplate(emailData),
      });

      if (result.success === false) {
        logger.error(`Error sending email: ${result.error}`);
      }
    }
  }

  return {
    success: true,
    comment: newComment.content,
  };
}

export async function updateContributionStatus(
  contributionId: string,
  status: 'selected' | 'rejected',
): Promise<typeof contribution.$inferSelect> {
  const contributionData = await db
    .select()
    .from(contribution)
    .where(eq(contribution.id, contributionId))
    .limit(1);

  if (contributionData.length === 0) {
    throw new ValidationError('Contribution not found');
  }

  if (contributionData[0].status !== 'pending') {
    throw new ValidationError('Contribution is not pending');
  }

  const result = await db
    .update(contribution)
    .set({ status })
    .where(eq(contribution.id, contributionId))
    .returning();

  if (result.length === 0) {
    throw new ValidationError('Contribution not found');
  }
  //  user table to get student name and email
  const [student] = await db
    .select()
    .from(user)
    .where(eq(user.id, result[0].studentId))
    .limit(1);

  if (student) {
    const emailData = {
      title: result[0].title,
      contributionId: result[0].id,
      student: {
        name: student.name!,
        email: student.email!,
      },
      status: result[0].status as 'selected' | 'rejected',
    };
    const emailResult = await sendEmail({
      to: student.email,
      subject: '🎉 Contribution Status Updated',
      html: updateContributionStatusEmailTemplate(emailData),
    });

    if (emailResult.success === false) {
      logger.error(`Error sending email: ${emailResult.error}`);
    }
  }

  return result[0];
}
