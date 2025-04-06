import { FastifyRequest, FastifyReply } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import {
  createComment,
  getContribution,
  createContribution,
  updateContribution,
  listMyContributions,
  listAllContributions,
  updateContributionStatus,
  downloadSelectedContributions,
  incrementContributionViewCount,
  listFacultySelectedContributions,
  marketingManagerContributionsReport,
  marketingManagerContributorsReport,
} from './contribution.services';

import {
  PaginationSchema,
  CreateCommentSchema,
  CreateContributionSchema,
  UpdateContributionSchema,
  UpdateContributionStatusSchema,
  DownloadSelectedContributionsQuerySchema,
} from './contribution.schema';

import { handleError } from '../../utils/errors';
import { logger } from '../../utils/logger';

export async function createContributionHandler(
  req: FastifyRequest,
  res: FastifyReply,
): Promise<void> {
  try {
    const data = req.body as CreateContributionSchema;
    const contribution = await createContribution(req.user, data);
    res.status(201).send(contribution);
  } catch (error) {
    handleError(error, req, res);
  }
}

export async function getContributionHandler(
  req: FastifyRequest,
  res: FastifyReply,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const contribution = await getContribution(id, req.user);
    res.send(contribution);
  } catch (error) {
    handleError(error, req, res);
  }
}

export async function updateContributionHandler(
  req: FastifyRequest,
  res: FastifyReply,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const data = req.body as UpdateContributionSchema;
    await updateContribution(id, req.user, data);
    res.status(200).send({ message: 'Contribution updated successfully' });
  } catch (error) {
    handleError(error, req, res);
  }
}

export async function listMyContributionsHandler(
  req: FastifyRequest,
  res: FastifyReply,
): Promise<void> {
  try {
    const params = req.query as PaginationSchema;
    const contributions = await listMyContributions(req.user.id, params);
    res.send(contributions);
  } catch (error) {
    handleError(error, req, res);
  }
}

export async function listFacultySelectedContributionsHandler(
  req: FastifyRequest,
  res: FastifyReply,
): Promise<void> {
  try {
    const params = req.query as PaginationSchema;
    const contributions = await listFacultySelectedContributions(
      req.user.facultyId!,
      params,
    );
    res.send(contributions);
  } catch (error) {
    handleError(error, req, res);
  }
}

export async function createCommentHandler(
  req: FastifyRequest,
  res: FastifyReply,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const data = req.body as CreateCommentSchema;
    const resp = await createComment(id, req.user, data);
    res.status(200).send(resp);
  } catch (error) {
    handleError(error, req, res);
  }
}

export async function updateContributionStatusHandler(
  req: FastifyRequest,
  res: FastifyReply,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const data = req.body as UpdateContributionStatusSchema;
    const contribution = await updateContributionStatus(
      id,
      data.status as 'selected' | 'rejected',
    );
    res.status(200).send(contribution);
  } catch (error) {
    handleError(error, req, res);
  }
}

export async function listAllContributionsHandler(
  req: FastifyRequest,
  res: FastifyReply,
): Promise<void> {
  try {
    const params = req.query as PaginationSchema;
    const contributions = await listAllContributions(
      req.user.facultyId!,
      params,
      req.user.role!,
    );
    res.send(contributions);
  } catch (error) {
    handleError(error, req, res);
  }
}

export async function incrementViewCountHandler(
  req: FastifyRequest,
  res: FastifyReply,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await incrementContributionViewCount(id);
    res.status(200).send({ success: true });
  } catch (error) {
    handleError(error, req, res);
  }
}

/**
 * Handler for downloading all selected contributions as a zip file
 * This endpoint is restricted to marketing manager role only
 * Optional academicYearId query parameter can be provided to filter by a specific academic year
 * If no academicYearId is provided, it determines the current academic year based on the current date
 */
export async function downloadSelectedContributionsHandler(
  req: FastifyRequest,
  res: FastifyReply,
): Promise<void> {
  try {
    const query = req.query as DownloadSelectedContributionsQuerySchema;
    const { zipFilePath, filename } = await downloadSelectedContributions(
      query.academicYearId,
    );

    // Set appropriate headers for file download
    res.header('Content-Type', 'application/zip');
    res.header('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the zip file
    const fileStream = fs.createReadStream(zipFilePath);

    // Clean up temp files after response is sent
    res.raw.on('finish', () => {
      try {
        const tempDir = path.dirname(zipFilePath);
        fs.unlinkSync(zipFilePath);
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        logger.error(`Error cleaning up temp files: ${cleanupError}`);
      }
    });

    // Send the file stream
    await res.send(fileStream);
  } catch (error) {
    handleError(error, req, res);
  }
}

/**
 * Handler for generating a report of contributions by faculty for each academic year
 * This endpoint is restricted to marketing manager role only
 */
export async function marketingManagerContributionsReportHandler(
  req: FastifyRequest,
  res: FastifyReply,
): Promise<void> {
  try {
    const report = await marketingManagerContributionsReport();
    res.send(report);
  } catch (error) {
    handleError(error, req, res);
  }
}

/**
 * Handler for generating a report of unique contributors by faculty for each academic year
 * This endpoint is restricted to marketing manager role only
 */
export async function marketingManagerContributorsReportHandler(
  req: FastifyRequest,
  res: FastifyReply,
): Promise<void> {
  try {
    const report = await marketingManagerContributorsReport();
    res.send(report);
  } catch (error) {
    handleError(error, req, res);
  }
}
