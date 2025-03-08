import { FastifyRequest, FastifyReply } from 'fastify';
import {
  createComment,
  getContribution,
  createContribution,
  updateContribution,
  listMyContributions,
  listFacultySelectedContributions,
  updateContributionStatus,
} from './contribution.services';

import {
  PaginationSchema,
  CreateCommentSchema,
  CreateContributionSchema,
  UpdateContributionSchema,
  UpdateContributionStatusSchema,
} from './contribution.schema';

import { handleError } from '../../utils/errors';

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
