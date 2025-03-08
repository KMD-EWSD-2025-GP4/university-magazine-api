import { FastifyInstance } from 'fastify';
import {
  getAllFacultiesHandler,
  getAcademicYearsHandler,
  getAcademicYearByIdHandler,
  getAcademicYearByDateHandler,
  getTermsHandler,
  getTermByIdHandler,
  getFacultyByIdHandler,
} from './academic.controllers';
import {
  getAcademicYearByIdJSONSchema,
  getAcademicYearByDateJSONSchema,
  getTermByIdJSONSchema,
  getFacultyByIdJSONSchema,
} from './academic.schema';
import { authenticateRequest } from '../../middleware/auth';

export async function academicRoutes(app: FastifyInstance) {
  app.get(
    '/faculty',
    {
      onRequest: [authenticateRequest],
    },
    getAllFacultiesHandler,
  );

  app.get(
    '/faculty/by-id/:id',
    {
      schema: getFacultyByIdJSONSchema,
      onRequest: [authenticateRequest],
    },
    getFacultyByIdHandler,
  );

  app.get(
    '/academic-year',
    {
      onRequest: [authenticateRequest],
    },
    getAcademicYearsHandler,
  );

  app.get(
    '/academic-year/by-id/:id',
    {
      schema: getAcademicYearByIdJSONSchema,
      onRequest: [authenticateRequest],
    },
    getAcademicYearByIdHandler,
  );

  app.get(
    '/academic-year/by-date',
    {
      schema: getAcademicYearByDateJSONSchema,
      onRequest: [authenticateRequest],
    },
    getAcademicYearByDateHandler,
  );

  app.get(
    '/term',
    {
      onRequest: [authenticateRequest],
    },
    getTermsHandler,
  );

  app.get(
    '/term/by-id/:id',
    {
      schema: getTermByIdJSONSchema,
      onRequest: [authenticateRequest],
    },
    getTermByIdHandler,
  );
}
