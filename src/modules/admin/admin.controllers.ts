import { FastifyRequest, FastifyReply } from 'fastify';
import {
  changeUserRole,
  createAcademicYear,
  createFaculty,
  deleteFaculty,
  resetUserPassword,
  updateFaculty,
  updateAcademicYear,
  deleteAcademicYear,
  createTerm,
  deleteTerm,
  updateTerm,
} from './admin.services';
import { AppError } from '../../utils/errors';
import {
  changeUserRoleBodySchema,
  createAcademicYearBodySchema,
  createFacultyBodySchema,
  createTermBodySchema,
  deleteAcademicYearBodySchema,
  deleteFacultyBodySchema,
  deleteTermBodySchema,
  resetUserPasswordBodySchema,
  updateAcademicYearBodySchema,
  updateFacultyBodySchema,
  updateTermBodySchema,
} from './admin.schema';
import { Role } from '../../types/roles';
import { logger } from '../../utils/logger';
export async function resetUserPasswordHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { userId, newPassword } = req.body as resetUserPasswordBodySchema;
    await resetUserPassword(userId, newPassword);
    res.status(200).send({ message: 'Password reset successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to reset password');
  }
}

export async function changeUserRoleHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { userId, newRole } = req.body as changeUserRoleBodySchema;
    await changeUserRole(userId, newRole as Role);
    res.status(200).send({ message: 'User role changed successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to change user role');
  }
}

export async function createFacultyHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { name } = req.body as createFacultyBodySchema;
    await createFaculty(name);
    res.status(200).send({ message: 'Faculty created successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to create faculty');
  }
}

export async function deleteFacultyHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { id } = req.body as deleteFacultyBodySchema;
    await deleteFaculty(id);
    res.status(200).send({ message: 'Faculty deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
  }
}

export async function updateFacultyHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { id, name } = req.body as updateFacultyBodySchema;
    await updateFaculty(id, name);
    res.status(200).send({ message: 'Faculty updated successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to update faculty');
  }
}

export async function createAcademicYearHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { startDate, endDate, newClosureDate, finalClosureDate } =
      req.body as createAcademicYearBodySchema;
    await createAcademicYear(
      startDate,
      endDate,
      newClosureDate,
      finalClosureDate,
    );
    res.status(200).send({ message: 'Academic year created successfully' });
  } catch (error) {
    logger.error(`Failed to create academic year: ${error}`);
    logger.error(`Error stack: ${error.stack}`);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to create academic year');
  }
}

export async function deleteAcademicYearHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { id } = req.body as deleteAcademicYearBodySchema;
    await deleteAcademicYear(id);
    res.status(200).send({ message: 'Academic year deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
  }
}

export async function updateAcademicYearHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { id, startDate, endDate, newClosureDate, finalClosureDate } =
      req.body as updateAcademicYearBodySchema;
    await updateAcademicYear(
      id,
      startDate,
      endDate,
      newClosureDate,
      finalClosureDate,
    );
    res.status(200).send({ message: 'Academic year updated successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to update academic year');
  }
}

export async function createTermHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { name, content } = req.body as createTermBodySchema;
    await createTerm(name, content);
    res.status(200).send({ message: 'Term created successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
  }
}

export async function deleteTermHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { id } = req.body as deleteTermBodySchema;
    await deleteTerm(id);
    res.status(200).send({ message: 'Term deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to delete term');
  }
}

export async function updateTermHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { id, name, content } = req.body as updateTermBodySchema;
    await updateTerm(id, name, content);
    res.status(200).send({ message: 'Term updated successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to update term');
  }
}
