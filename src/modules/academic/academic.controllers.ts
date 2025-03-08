import { FastifyRequest, FastifyReply } from 'fastify';
import {
  getAllFaculties,
  getAcademicYears,
  getAcademicYearById,
  getAcademicYearByDate,
  getTerms,
  getTermById,
  getFacultyById,
} from './academic.services';
import { handleError } from '../../utils/errors';
import {
  getAcademicYearByIdParamsSchema,
  getAcademicYearByDateParamsSchema,
  getTermByIdParamsSchema,
  getFacultyByIdParamsSchema,
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
    handleError(error, req, res);
  }
}

export async function getFacultyByIdHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { id } = req.params as getFacultyByIdParamsSchema;
    const faculty = await getFacultyById(id);
    res.status(200).send(faculty);
  } catch (error) {
    handleError(error, req, res);
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
    handleError(error, req, res);
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
    handleError(error, req, res);
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
    handleError(error, req, res);
  }
}

export async function getTermsHandler(req: FastifyRequest, res: FastifyReply) {
  try {
    const terms = await getTerms();
    res.status(200).send(terms);
  } catch (error) {
    handleError(error, req, res);
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
    handleError(error, req, res);
  }
}
