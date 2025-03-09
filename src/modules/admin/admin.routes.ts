import { FastifyInstance } from 'fastify';
import {
  changeUserFacultyHandler,
  changeUserRoleHandler,
  changeUserStatusHandler,
  createAcademicYearHandler,
  createFacultyHandler,
  deleteAcademicYearHandler,
  deleteFacultyHandler,
  resetUserPasswordHandler,
  updateAcademicYearHandler,
  updateFacultyHandler,
  createTermHandler,
  deleteTermHandler,
  updateTermHandler,
  createUserHandler,
  updateUserHandler,
} from './admin.controllers';
import {
  changeUserRoleJSONSchema,
  changeUserStatusJSONSchema,
  createAcademicYearJSONSchema,
  createFacultyJSONSchema,
  deleteAcademicYearJSONSchema,
  deleteFacultyJSONSchema,
  resetUserPasswordJSONSchema,
  updateAcademicYearJSONSchema,
  updateFacultyJSONSchema,
  createTermJSONSchema,
  deleteTermJSONSchema,
  updateTermJSONSchema,
  changeUserFacultyJSONSchema,
  createUserJSONSchema,
  updateUserJSONSchema,
} from './admin.schema';
import { authenticateRequest } from '../../middleware/auth';
import { checkRole } from '../../middleware/auth';

export async function adminRoutes(app: FastifyInstance) {
  app.post(
    '/reset-user-password',
    {
      schema: resetUserPasswordJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['admin'])],
    },
    resetUserPasswordHandler,
  );

  app.post(
    '/user',
    {
      schema: createUserJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['admin'])],
    },
    createUserHandler,
  );

  app.put(
    '/user',
    {
      schema: updateUserJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['admin'])],
    },
    updateUserHandler,
  );

  app.post(
    '/faculty',
    {
      schema: createFacultyJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['admin'])],
    },
    createFacultyHandler,
  );

  app.delete(
    '/faculty',
    {
      schema: deleteFacultyJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['admin'])],
    },
    deleteFacultyHandler,
  );

  app.put(
    '/faculty',
    {
      schema: updateFacultyJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['admin'])],
    },
    updateFacultyHandler,
  );

  app.post(
    '/academic-year',
    {
      schema: createAcademicYearJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['admin'])],
    },
    createAcademicYearHandler,
  );

  app.delete(
    '/academic-year',
    {
      schema: deleteAcademicYearJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['admin'])],
    },
    deleteAcademicYearHandler,
  );

  app.put(
    '/academic-year',
    {
      schema: updateAcademicYearJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['admin'])],
    },
    updateAcademicYearHandler,
  );

  app.post(
    '/term',
    {
      schema: createTermJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['admin'])],
    },
    createTermHandler,
  );

  app.delete(
    '/term',
    {
      schema: deleteTermJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['admin'])],
    },
    deleteTermHandler,
  );

  app.put(
    '/term',
    {
      schema: updateTermJSONSchema,
      onRequest: [authenticateRequest],
      preHandler: [checkRole(['admin'])],
    },
    updateTermHandler,
  );
}
