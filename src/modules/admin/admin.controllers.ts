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
  createUser,
  changeUserFaculty,
  changeUserStatus,
  updateUser,
} from './admin.services';
import { handleError } from '../../utils/errors';
import {
  changeUserRoleBodySchema,
  changeUserFacultyBodySchema,
  createAcademicYearBodySchema,
  createFacultyBodySchema,
  createTermBodySchema,
  createUserBodySchema,
  deleteAcademicYearBodySchema,
  deleteFacultyBodySchema,
  deleteTermBodySchema,
  resetUserPasswordBodySchema,
  updateAcademicYearBodySchema,
  updateFacultyBodySchema,
  updateTermBodySchema,
  changeUserStatusBodySchema,
  updateUserBodySchema,
} from './admin.schema';
import { Role } from '../../types/roles';

export async function createUserHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { email, password, role, name, facultyId } =
      req.body as createUserBodySchema;
    await createUser(email, password, role, name, facultyId);
    res.status(200).send({ message: 'User created successfully' });
  } catch (error) {
    handleError(error, req, res);
  }
}

export async function updateUserHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { userId, password, role, facultyId, status } =
      req.body as updateUserBodySchema;
    await updateUser(userId, password, role, facultyId, status);
    res.status(200).send({ message: 'User updated successfully' });
  } catch (error) {
    handleError(error, req, res);
  }
}

export async function resetUserPasswordHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { userId, newPassword } = req.body as resetUserPasswordBodySchema;
    await resetUserPassword(userId, newPassword);
    res.status(200).send({ message: 'Password reset successfully' });
  } catch (error) {
    handleError(error, req, res);
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
    handleError(error, req, res);
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
    handleError(error, req, res);
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
    handleError(error, req, res);
  }
}

export async function updateFacultyHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { id, name, status } = req.body as updateFacultyBodySchema;
    await updateFaculty(id, name, status);
    res.status(200).send({ message: 'Faculty updated successfully' });
  } catch (error) {
    handleError(error, req, res);
  }
}

export async function changeUserFacultyHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { userId, newFacultyId } = req.body as changeUserFacultyBodySchema;
    await changeUserFaculty(userId, newFacultyId);
    res.status(200).send({ message: 'User faculty changed successfully' });
  } catch (error) {
    handleError(error, req, res);
  }
}

export async function changeUserStatusHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { userId, status } = req.body as changeUserStatusBodySchema;
    await changeUserStatus(userId, status);
    res.status(200).send({ message: 'User status changed successfully' });
  } catch (error) {
    handleError(error, req, res);
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
    handleError(error, req, res);
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
    handleError(error, req, res);
  }
}

export async function updateAcademicYearHandler(
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const { id, startDate, endDate, newClosureDate, finalClosureDate, status } =
      req.body as updateAcademicYearBodySchema;
    await updateAcademicYear(
      id,
      startDate,
      endDate,
      newClosureDate,
      finalClosureDate,
      status,
    );
    res.status(200).send({ message: 'Academic year updated successfully' });
  } catch (error) {
    handleError(error, req, res);
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
    handleError(error, req, res);
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
    handleError(error, req, res);
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
    handleError(error, req, res);
  }
}
