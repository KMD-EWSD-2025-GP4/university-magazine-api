import { FastifyRequest, FastifyReply } from 'fastify';
import {
  getAllFaculties,
  getAcademicYears,
  getAcademicYearById,
  getAcademicYearByDate,
  getTerms,
  getTermById,
} from './academic.services';
import { AppError } from '../../utils/errors';
import {
  getAcademicYearByIdParamsSchema,
  getAcademicYearByDateParamsSchema,
  getTermByIdParamsSchema,
} from './academic.schema';
import { logger } from '../../utils/logger';

export async function getAllFacultiesHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const faculties = await getAllFaculties();
    res.status(200).send(faculties);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to get faculties');
  }
}

export async function getAcademicYearsHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const academicYears = await getAcademicYears();
    res.status(200).send(academicYears);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to get academic years');
  }
}

export async function getAcademicYearByIdHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { id } = req.params as getAcademicYearByIdParamsSchema;
    const academicYear = await getAcademicYearById(id);
    res.status(200).send(academicYear);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to get academic year by id');
  }
}

export async function getAcademicYearByDateHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { date } = req.query as getAcademicYearByDateParamsSchema;
    logger.info(`date in controller: ${date}`);
    const convertedDate = new Date(date);
    const academicYear = await getAcademicYearByDate(convertedDate);
    logger.info(`academic year in controller: ${academicYear}`);
    res.status(200).send(academicYear);
  } catch (error) {
    logger.error(`Failed to get academic year by date: ${error}`);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to get academic year by date');
  }
}

export async function getTermsHandler(req: FastifyRequest, res: FastifyReply) {
  try {
    const terms = await getTerms();
    res.status(200).send(terms);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to get terms');
  }
}

export async function getTermByIdHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { id } = req.params as getTermByIdParamsSchema;
    const term = await getTermById(id);
    res.status(200).send(term);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to get term by id');
  }
}
