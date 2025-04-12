import * as fs from 'fs';
import * as os from 'os';
import axios from 'axios';
import * as path from 'path';
import archiver from 'archiver';
import { env } from '../../config/env';
import { eq, and, sql, desc, aliasedTable } from 'drizzle-orm';

import {
  user,
  comment,
  faculty,
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
import { formatAcademicYearString } from '../../utils/formatters';

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
  try {
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
      throw new ValidationError(
        'No active academic year found for submissions',
      );
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
      createdDate: now.toLocaleDateString('en-GB'),
    };

    // Send email notification to faculty's marketing coordinator
    logger.info(`Sending email to ${marketingCoordinator.email}`);
    const result = await sendEmail({
      to: marketingCoordinator.email,
      subject: '🎉 New Contribution Submission',
      html: newContributionEmailTemplate(emailData),
    });
    logger.info(`Result: ${JSON.stringify(result)}`);

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
  } catch (error) {
    logger.error(`Error creating contribution: ${error}`);
    throw error;
  }
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
        studentName: string;
        academicYear: string;
      })
    | [];
}> {
  const contributionData = await db
    .select()
    .from(contribution)
    .where(eq(contribution.id, contributionId))
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
        'Only selected contributions from their own faculty can be viewed by guests',
      );
    }
  }

  if (currentUser.role === 'marketing_manager') {
    if (contributionData[0].status !== 'selected') {
      throw new ForbiddenError(
        'Only selected contributions can be viewed by marketing managers',
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

  // Get student name
  const [student] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, contributionData[0].studentId))
    .limit(1);

  // Get academic year
  const [year] = await db
    .select({
      startDate: academicYear.startDate,
      endDate: academicYear.endDate,
    })
    .from(academicYear)
    .where(eq(academicYear.id, contributionData[0].academicYearId))
    .limit(1);

  const academicYearString = formatAcademicYearString(
    new Date(year.startDate),
    new Date(year.endDate),
  );

  // Increment view count
  // await incrementContributionViewCount(contributionId).catch(logger.error);

  return {
    success: true,
    data: {
      ...contributionData[0],
      assets: assetsWithUrls,
      comments,
      studentName: student.name,
      academicYear: academicYearString,
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

  if (contributionData[0].status !== 'pending') {
    throw new ValidationError(
      `This contribution can no longer be updated since it is already ${contributionData[0].status}`,
    );
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
): Promise<
  PaginatedResponse<
    typeof contribution.$inferSelect & {
      studentName: string;
      academicYear: string;
    }
  >
> {
  const { academicYearId } = params;
  const { limit = 20, cursor, order } = getPaginationParams(params);

  if (limit > 20) {
    throw new ValidationError('Limit must be less than or equal to 20');
  }

  const whereConditions = [
    eq(contribution.studentId, studentId),
    createPaginationQuery(sql`${contribution.createdAt}`, {
      cursor,
      order,
    }),
  ];

  if (academicYearId) {
    whereConditions.push(eq(contribution.academicYearId, academicYearId));
  }

  const items = await db
    .select()
    .from(contribution)
    .where(and(...whereConditions))
    .orderBy(sql`${contribution.createdAt} ${sql.raw(order)}`)
    .limit(limit + 1);

  // Fetch assets, student name and academic year for each contribution
  const itemsWithDetails = await Promise.all(
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

      const [student] = await db
        .select({ name: user.name })
        .from(user)
        .where(eq(user.id, item.studentId))
        .limit(1);

      const [year] = await db
        .select({
          startDate: academicYear.startDate,
          endDate: academicYear.endDate,
        })
        .from(academicYear)
        .where(eq(academicYear.id, item.academicYearId))
        .limit(1);

      const academicYearString = formatAcademicYearString(
        new Date(year.startDate),
        new Date(year.endDate),
      );

      return {
        ...item,
        assets: assetsWithUrls,
        studentName: student.name,
        academicYear: academicYearString,
      };
    }),
  );

  if (itemsWithDetails.length === 0) return { items: [], nextCursor: null };

  const hasMore = itemsWithDetails.length > limit;

  // if desc pop first before cursor extraction
  if (order === 'desc' && hasMore) itemsWithDetails.pop();

  const nextCursor = hasMore
    ? itemsWithDetails[itemsWithDetails.length - 1].createdAt!.toISOString()
    : null;

  // if asc pop after cursor extraction
  if (order === 'asc' && hasMore) items.pop();

  return {
    items: itemsWithDetails,
    nextCursor: nextCursor ? encodeToken(nextCursor) : nextCursor,
  };
}

export async function listFacultySelectedContributions(
  facultyId: string,
  params: PaginationParams,
): Promise<
  PaginatedResponse<
    typeof contribution.$inferSelect & {
      studentId: string;
      studentName: string;
      email: string;
      academicYear: string;
    }
  >
> {
  const { academicYearId } = params;
  const { limit = 20, cursor, order } = getPaginationParams(params);

  if (limit > 20) {
    throw new ValidationError('Limit must be less than or equal to 20');
  }

  const student = aliasedTable(user, 'student');

  const whereConditions = [
    eq(contribution.facultyId, facultyId),
    eq(contribution.status, 'selected'),
    createPaginationQuery(sql`${contribution.createdAt}`, {
      cursor,
      order,
    }),
  ];

  if (academicYearId) {
    whereConditions.push(eq(contribution.academicYearId, academicYearId));
  }

  const items = await db
    .select({
      studentId: student.id,
      studentName: student.name,
      email: student.email,
      contribution: contribution,
    })
    .from(contribution)
    .innerJoin(student, eq(student.id, contribution.studentId))
    .where(and(...whereConditions))
    .orderBy(sql`${contribution.createdAt} ${sql.raw(order)}`)
    .limit(limit + 1);

  // Fetch assets and academic year for each contribution
  const itemsWithDetails = await Promise.all(
    items.map(async (item) => {
      const assets = await db
        .select()
        .from(contributionAsset)
        .where(eq(contributionAsset.contributionId, item.contribution.id));

      const assetsWithUrls = await Promise.all(
        assets.map(async (asset) => ({
          ...asset,
          url: await generatePresignedDownloadUrl(
            'ewsd-bucket',
            asset.filePath,
          ),
        })),
      );

      const [year] = await db
        .select({
          startDate: academicYear.startDate,
          endDate: academicYear.endDate,
        })
        .from(academicYear)
        .where(eq(academicYear.id, item.contribution.academicYearId))
        .limit(1);

      const academicYearString = formatAcademicYearString(
        new Date(year.startDate),
        new Date(year.endDate),
      );

      return {
        ...item,
        contribution: {
          ...item.contribution,
          assets: assetsWithUrls,
          academicYear: academicYearString,
        },
      };
    }),
  );

  if (itemsWithDetails.length === 0) return { items: [], nextCursor: null };

  const hasMore = itemsWithDetails.length > limit;

  // if desc pop first before cursor extraction
  if (order === 'desc' && hasMore) itemsWithDetails.pop();

  const nextCursor = hasMore
    ? itemsWithDetails[
        itemsWithDetails.length - 1
      ].contribution.createdAt!.toISOString()
    : null;

  // if asc pop after cursor extraction
  if (order === 'asc' && hasMore) itemsWithDetails.pop();

  return {
    items: itemsWithDetails.map((item) => ({
      ...item.contribution,
      studentId: item.studentId,
      studentName: item.studentName,
      email: item.email,
    })),
    nextCursor: nextCursor ? encodeToken(nextCursor) : nextCursor,
  };
}

export async function listAllContributions(
  facultyId: string,
  params: PaginationParams,
  role: string,
): Promise<
  PaginatedResponse<
    typeof contribution.$inferSelect & {
      studentName: string;
      academicYear: string;
      assets: (typeof contributionAsset.$inferSelect)[];
    }
  >
> {
  const { academicYearId } = params;

  const whereConditions = [];

  if (academicYearId) {
    whereConditions.push(eq(contribution.academicYearId, academicYearId));
  }

  // Add status filter for marketing_manager role
  if (role === 'marketing_manager') {
    whereConditions.push(eq(contribution.status, 'selected'));
  }

  // Add status filter for marketing_coordinator role
  if (role === 'marketing_coordinator') {
    whereConditions.push(eq(contribution.facultyId, facultyId));
  }

  const items = await db
    .select()
    .from(contribution)
    .where(and(...whereConditions))
    .orderBy(sql`${contribution.createdAt}`);

  // Fetch assets, student name and academic year for each contribution
  const itemsWithDetails = await Promise.all(
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

      const [student] = await db
        .select({ name: user.name })
        .from(user)
        .where(eq(user.id, item.studentId))
        .limit(1);

      const [year] = await db
        .select({
          startDate: academicYear.startDate,
          endDate: academicYear.endDate,
        })
        .from(academicYear)
        .where(eq(academicYear.id, item.academicYearId))
        .limit(1);

      const [{ name: facultyName }] = await db
        .select({ name: faculty.name })
        .from(faculty)
        .where(eq(faculty.id, item.facultyId))
        .limit(1);

      const academicYearString = formatAcademicYearString(
        new Date(year.startDate),
        new Date(year.endDate),
      );

      const baseResult = {
        ...item,
        assets: assetsWithUrls,
        studentName: student.name,
        academicYear: academicYearString,
        facultyName,
      };

      // Add dueDate for marketing coordinator role
      if (role === 'marketing_coordinator') {
        const createdAt = new Date(item.createdAt!);
        const dueDate = new Date(createdAt);
        dueDate.setDate(createdAt.getDate() + 14);
        return {
          ...baseResult,
          dueDate,
        };
      }

      return baseResult;
    }),
  );

  if (itemsWithDetails.length === 0) return { items: [], nextCursor: null };

  return {
    items: itemsWithDetails,
    nextCursor: null,
  };
}

export async function createComment(
  contributionId: string,
  currentUser: Partial<typeof user.$inferSelect>,
  data: { comment: string },
): Promise<{ success: boolean; comment: string }> {
  try {
    // Check if contribution exists
    const contributionData = await db
      .select()
      .from(contribution)
      .where(eq(contribution.id, contributionId))
      .limit(1);

    if (contributionData.length === 0)
      throw new ValidationError('Contribution not found');

    // Check if there are any existing comments
    const existingComments = await db
      .select()
      .from(comment)
      .where(eq(comment.contributionId, contributionId));

    // If student is trying to write the first comment, prevent it
    if (currentUser.role === 'student' && existingComments.length === 0) {
      throw new ValidationError('Students cannot write the first comment');
    }

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
      // If comment is from student, send email to marketing coordinator
      // If comment is from marketing coordinator, send email to student
      const recipientRole =
        currentUser.role === 'student' ? 'marketing_coordinator' : 'student';

      // Get the recipient based on role
      const [recipient] = await db
        .select()
        .from(user)
        .where(
          recipientRole === 'student'
            ? eq(user.id, contributionData[0].studentId)
            : and(
                eq(user.facultyId, contributionData[0].facultyId),
                eq(user.role, 'marketing_coordinator'),
              ),
        )
        .limit(1);

      if (recipient) {
        const emailData = {
          title: contributionData[0].title,
          contributionId: contributionData[0].id,
          recipient: {
            name: recipient.name!,
            email: recipient.email!,
          },
          sender: {
            name: currentUser.name!,
            role: currentUser.role as 'student' | 'marketing_coordinator',
          },
        };

        logger.info(`Sending email to ${recipient.email}`);
        const result = await sendEmail({
          to: recipient.email,
          subject: '🎉 New Comment on Contribution',
          html: newCommentEmailTemplate(emailData),
        });
        logger.info(`Result: ${JSON.stringify(result)}`);
        if (result.success === false) {
          logger.error(`Error sending email: ${result.error}`);
        }
      }
    }

    // update the contribution feedback_given status for analytics
    if (currentUser.role !== 'student' && existingComments.length === 0) {
      await db
        .update(contribution)
        .set({ feedbackGiven: true })
        .where(eq(contribution.id, contributionId));
    }

    return {
      success: true,
      comment: newComment.content,
    };
  } catch (error) {
    logger.error(`Error creating comment: ${error}`);
    throw error;
  }
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
    logger.info(`Email result: ${JSON.stringify(emailResult)}`);
    if (emailResult.success === false) {
      logger.error(`Error sending email: ${emailResult.error}`);
      throw new Error('Error sending email');
    }
  }

  return result[0];
}

/**
 * Downloads selected contributions as a zip file
 * This function retrieves all contributions with status='selected'
 * If no academicYearId is provided, it determines the current academic year based on the current date
 * @param academicYearId Optional academic year ID to filter contributions
 */
export async function downloadSelectedContributions(
  academicYearId?: string,
): Promise<{ zipFilePath: string; filename: string }> {
  let selectedAcademicYearId = academicYearId;
  let academicYearInfo = null;

  // If no academicYearId provided, find the current academic year based on current date
  if (!selectedAcademicYearId) {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    const currentAcademicYear = await db
      .select()
      .from(academicYear)
      .where(
        and(
          sql`${academicYear.startDate} <= ${formattedDate}`,
          sql`${academicYear.endDate} >= ${formattedDate}`,
        ),
      )
      .limit(1);

    if (currentAcademicYear.length === 0) {
      throw new ValidationError(
        'No academic year found for the current date. Please specify an academic year ID.',
      );
    }

    selectedAcademicYearId = currentAcademicYear[0].id;
    academicYearInfo = currentAcademicYear[0];
  }

  // Get all contributions with status='selected' from the selected academic year
  const selectedContributions = await db
    .select({
      contribution: contribution,
      student: user,
      faculty: faculty,
      academicYear: academicYear,
    })
    .from(contribution)
    .leftJoin(user, eq(contribution.studentId, user.id))
    .leftJoin(faculty, eq(contribution.facultyId, faculty.id))
    .leftJoin(academicYear, eq(contribution.academicYearId, academicYear.id))
    .where(
      and(
        eq(contribution.status, 'selected'),
        eq(contribution.academicYearId, selectedAcademicYearId),
      ),
    );

  if (selectedContributions.length === 0) {
    // If we already have academic year info, use it for a better error message
    if (academicYearInfo) {
      const startYear = new Date(academicYearInfo.startDate).getFullYear();
      const endYear = new Date(academicYearInfo.endDate).getFullYear();
      throw new ValidationError(
        `No selected contributions found for the academic year ${startYear}-${endYear}`,
      );
    } else {
      throw new ValidationError(
        'No selected contributions found for the specified academic year',
      );
    }
  }

  // 2. Get all assets for these contributions
  const contributionIds = selectedContributions.map(
    (item) => item.contribution.id,
  );
  const assets = await db
    .select()
    .from(contributionAsset)
    .where(sql`${contributionAsset.contributionId} IN ${contributionIds}`);

  // 3. Create temp directory for downloads
  const tempDir = path.join(
    os.tmpdir(),
    'contribution-downloads-' + Date.now(),
  );
  fs.mkdirSync(tempDir, { recursive: true });

  // 4. Download all assets from S3
  const downloadPromises = assets.map(async (asset) => {
    try {
      const downloadUrl = await generatePresignedDownloadUrl(
        env.AWS_BUCKET_NAME,
        asset.filePath,
      );
      const assetFilename = path.basename(asset.filePath);
      const contributionFolder = path.join(tempDir, asset.contributionId);

      // Create folder for each contribution
      fs.mkdirSync(contributionFolder, { recursive: true });

      // Download file
      const response = await axios({
        method: 'GET',
        url: downloadUrl,
        responseType: 'stream',
      });

      const outputPath = path.join(contributionFolder, assetFilename);
      const writer = fs.createWriteStream(outputPath);

      response.data.pipe(writer);

      return new Promise<void>((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      logger.error(`Error downloading asset ${asset.id}: ${error}`);
      throw error;
    }
  });

  await Promise.all(downloadPromises);

  // 5. Create info text file for each contribution
  for (const item of selectedContributions) {
    const { contribution: contrib, student, faculty, academicYear } = item;
    const contributionFolder = path.join(tempDir, contrib.id);

    // Format the submission date
    const submissionDate = contrib.submissionDate
      ? new Date(contrib.submissionDate).toLocaleString()
      : 'N/A';
    const lastUpdated = contrib.lastUpdated
      ? new Date(contrib.lastUpdated).toLocaleString()
      : 'N/A';

    // Create info text content with null checks
    const infoContent = `CONTRIBUTION INFORMATION
==============================
Title: ${contrib.title || 'N/A'}
Description: ${contrib.description || 'N/A'}
Status: ${contrib.status || 'N/A'}
Submission Date: ${submissionDate}
Last Updated: ${lastUpdated}
View Count: ${contrib.viewCount || 0}

STUDENT INFORMATION
==============================
Name: ${student?.name || 'N/A'}
Email: ${student?.email || 'N/A'}
Faculty: ${faculty?.name || 'Unknown'}

ACADEMIC YEAR INFORMATION
==============================
${academicYear ? `Start Date: ${new Date(academicYear.startDate).toLocaleString()}\nEnd Date: ${new Date(academicYear.endDate).toLocaleString()}` : 'N/A'}
`;

    // Write info file
    fs.writeFileSync(
      path.join(contributionFolder, 'contribution_info.txt'),
      infoContent,
    );
  }

  // 6. Create zip file
  let zipFilename = 'selected-contributions';

  // Format the filename with more details if we have academic year info
  // First check selectedContributions, then fall back to academicYearInfo if needed
  let yearInfoToUse = null;

  if (
    selectedContributions.length > 0 &&
    selectedContributions[0].academicYear
  ) {
    yearInfoToUse = selectedContributions[0].academicYear;
  } else if (academicYearInfo) {
    yearInfoToUse = academicYearInfo;
  }

  if (yearInfoToUse && yearInfoToUse.startDate && yearInfoToUse.endDate) {
    // Format: selected-contributions-2025-01-to-2025-08-academic-year.zip
    const startDate = new Date(yearInfoToUse.startDate);
    const endDate = new Date(yearInfoToUse.endDate);

    const startYear = startDate.getFullYear();
    const startMonth = String(startDate.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-indexed

    const endYear = endDate.getFullYear();
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');

    zipFilename = `selected-contributions-${startYear}-${startMonth}-to-${endYear}-${endMonth}-academic-year`;
  }

  // Add .zip extension
  zipFilename += '.zip';
  const zipFilePath = path.join(tempDir, zipFilename);
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);

  // Add each contribution folder to the zip with its ID as the folder name
  for (const item of selectedContributions) {
    const contributionFolder = path.join(tempDir, item.contribution.id);
    archive.directory(contributionFolder, item.contribution.id);
  }

  // Wait for the zip to finish
  return new Promise<{ zipFilePath: string; filename: string }>(
    (resolve, reject) => {
      output.on('close', () => {
        resolve({ zipFilePath, filename: zipFilename });
      });

      archive.on('error', (err: Error) => {
        reject(err);
      });

      archive.finalize();
    },
  );
}

export async function incrementContributionViewCount(
  contributionId: string,
): Promise<void> {
  await db
    .update(contribution)
    .set({
      viewCount: sql`${contribution.viewCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(contribution.id, contributionId));
}

/**
 * Gets the most viewed contributions
 * If academicYearId is provided, it filters by that academic year
 * Otherwise, it finds and uses the current/latest academic year automatically
 * @param academicYearId Optional academic year ID to filter contributions
 * @param limit Optional number of contributions to return (default: 5)
 */
export async function getMostViewedContributions(
  academicYearId?: string,
  limit: number = 5,
): Promise<
  Array<
    typeof contribution.$inferSelect & {
      studentName: string;
      facultyName: string;
      academicYear: string;
    }
  >
> {
  let currentAcademicYearId = academicYearId;

  // If no academicYearId is provided, find the current/latest academic year
  if (!currentAcademicYearId) {
    const currentDate = new Date();
    const latestAcademicYear = await db
      .select()
      .from(academicYear)
      .where(
        and(
          sql`${academicYear.startDate} <= ${currentDate}`,
          sql`${academicYear.endDate} >= ${currentDate}`,
        ),
      )
      .limit(1);

    // If a current academic year is found, use it
    if (latestAcademicYear.length > 0) {
      currentAcademicYearId = latestAcademicYear[0].id;
    } else {
      // If no current academic year, find the most recent one
      const mostRecentAcademicYear = await db
        .select()
        .from(academicYear)
        .orderBy(desc(academicYear.endDate))
        .limit(1);

      if (mostRecentAcademicYear.length > 0) {
        currentAcademicYearId = mostRecentAcademicYear[0].id;
      }
    }
  }

  // Base where condition - always filter for selected contributions
  const whereConditions = [eq(contribution.status, 'selected')];

  // Add academic year filter if we have an ID
  if (currentAcademicYearId) {
    whereConditions.push(
      eq(contribution.academicYearId, currentAcademicYearId),
    );
  }

  // Use a single join query to fetch all the required data at once
  const results = await db
    .select({
      contribution: contribution,
      studentName: user.name,
      facultyName: faculty.name,
      academicYearStartDate: academicYear.startDate,
      academicYearEndDate: academicYear.endDate,
    })
    .from(contribution)
    .innerJoin(user, eq(contribution.studentId, user.id))
    .innerJoin(faculty, eq(contribution.facultyId, faculty.id))
    .innerJoin(academicYear, eq(contribution.academicYearId, academicYear.id))
    .where(and(...whereConditions))
    .orderBy(desc(contribution.viewCount))
    .limit(limit);

  // Format the results to match the expected return type
  return results.map((item) => {
    const academicYearString = formatAcademicYearString(
      new Date(item.academicYearStartDate),
      new Date(item.academicYearEndDate),
    );

    return {
      ...item.contribution,
      studentName: item.studentName,
      facultyName: item.facultyName,
      academicYear: academicYearString,
    };
  });
}
