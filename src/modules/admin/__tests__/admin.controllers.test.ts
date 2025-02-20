import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as adminControllers from '../admin.controllers';
import * as adminServices from '../admin.services';
import { AppError } from '../../../utils/errors';

// Mock admin services
vi.mock('../admin.services', () => ({
  resetUserPassword: vi.fn(),
  changeUserRole: vi.fn(),
  createFaculty: vi.fn(),
  deleteFaculty: vi.fn(),
  updateFaculty: vi.fn(),
  createAcademicYear: vi.fn(),
  deleteAcademicYear: vi.fn(),
  updateAcademicYear: vi.fn(),
  createTerm: vi.fn(),
  deleteTerm: vi.fn(),
  updateTerm: vi.fn(),
}));

describe('Admin Controllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Management', () => {
    describe('resetUserPasswordHandler', () => {
      it('should reset password successfully', async () => {
        const req = {
          body: {
            userId: 'test-user-id',
            newPassword: 'newPassword123',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await adminControllers.resetUserPasswordHandler(req as any, res as any);

        expect(adminServices.resetUserPassword).toHaveBeenCalledWith(
          req.body.userId,
          req.body.newPassword,
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Password reset successfully',
        });
      });

      it('should handle service errors', async () => {
        const req = {
          body: {
            userId: 'test-user-id',
            newPassword: 'newPassword123',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        vi.mocked(adminServices.resetUserPassword).mockRejectedValueOnce(
          new AppError(500, 'Failed to reset password'),
        );

        await expect(
          adminControllers.resetUserPasswordHandler(req as any, res as any),
        ).rejects.toThrow('Failed to reset password');
      });
    });

    describe('changeUserRoleHandler', () => {
      it('should change user role successfully', async () => {
        const req = {
          body: {
            userId: 'test-user-id',
            newRole: 'admin',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await adminControllers.changeUserRoleHandler(req as any, res as any);

        expect(adminServices.changeUserRole).toHaveBeenCalledWith(
          req.body.userId,
          req.body.newRole,
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          message: 'User role changed successfully',
        });
      });

      it('should handle service errors', async () => {
        const req = {
          body: {
            userId: 'test-user-id',
            newRole: 'admin',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        vi.mocked(adminServices.changeUserRole).mockRejectedValueOnce(
          new AppError(500, 'Failed to change user role'),
        );

        await expect(
          adminControllers.changeUserRoleHandler(req as any, res as any),
        ).rejects.toThrow('Failed to change user role');
      });
    });
  });

  describe('Faculty Management', () => {
    describe('createFacultyHandler', () => {
      it('should create faculty successfully', async () => {
        const req = {
          body: {
            name: 'Test Faculty',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await adminControllers.createFacultyHandler(req as any, res as any);

        expect(adminServices.createFaculty).toHaveBeenCalledWith(req.body.name);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Faculty created successfully',
        });
      });

      it('should handle service errors', async () => {
        const req = {
          body: {
            name: 'Test Faculty',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        vi.mocked(adminServices.createFaculty).mockRejectedValueOnce(
          new AppError(500, 'Failed to create faculty'),
        );

        await expect(
          adminControllers.createFacultyHandler(req as any, res as any),
        ).rejects.toThrow('Failed to create faculty');
      });
    });

    describe('deleteFacultyHandler', () => {
      it('should delete faculty successfully', async () => {
        const req = {
          body: {
            id: 'test-faculty-id',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await adminControllers.deleteFacultyHandler(req as any, res as any);

        expect(adminServices.deleteFaculty).toHaveBeenCalledWith(req.body.id);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Faculty deleted successfully',
        });
      });

      it('should handle service errors', async () => {
        const req = {
          body: {
            id: 'test-faculty-id',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        vi.mocked(adminServices.deleteFaculty).mockRejectedValueOnce(
          new AppError(500, 'Failed to delete faculty'),
        );

        await expect(
          adminControllers.deleteFacultyHandler(req as any, res as any),
        ).rejects.toThrow();
      });
    });

    describe('updateFacultyHandler', () => {
      it('should update faculty successfully', async () => {
        const req = {
          body: {
            id: 'test-faculty-id',
            name: 'Updated Faculty Name',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await adminControllers.updateFacultyHandler(req as any, res as any);

        expect(adminServices.updateFaculty).toHaveBeenCalledWith(
          req.body.id,
          req.body.name,
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Faculty updated successfully',
        });
      });

      it('should handle service errors', async () => {
        const req = {
          body: {
            id: 'test-faculty-id',
            name: 'Updated Faculty Name',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        vi.mocked(adminServices.updateFaculty).mockRejectedValueOnce(
          new AppError(500, 'Failed to update faculty'),
        );

        await expect(
          adminControllers.updateFacultyHandler(req as any, res as any),
        ).rejects.toThrow('Failed to update faculty');
      });
    });
  });

  describe('Academic Year Management', () => {
    describe('createAcademicYearHandler', () => {
      it('should create academic year successfully', async () => {
        const req = {
          body: {
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            newClosureDate: new Date('2024-06-01'),
            finalClosureDate: new Date('2024-07-01'),
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await adminControllers.createAcademicYearHandler(
          req as any,
          res as any,
        );

        expect(adminServices.createAcademicYear).toHaveBeenCalledWith(
          req.body.startDate,
          req.body.endDate,
          req.body.newClosureDate,
          req.body.finalClosureDate,
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Academic year created successfully',
        });
      });

      it('should handle service errors', async () => {
        const req = {
          body: {
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            newClosureDate: new Date('2024-06-01'),
            finalClosureDate: new Date('2024-07-01'),
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        vi.mocked(adminServices.createAcademicYear).mockRejectedValueOnce(
          new AppError(500, 'Failed to create academic year'),
        );

        await expect(
          adminControllers.createAcademicYearHandler(req as any, res as any),
        ).rejects.toThrow('Failed to create academic year');
      });
    });

    describe('deleteAcademicYearHandler', () => {
      it('should delete academic year successfully', async () => {
        const req = {
          body: {
            id: 'test-academic-year-id',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await adminControllers.deleteAcademicYearHandler(
          req as any,
          res as any,
        );

        expect(adminServices.deleteAcademicYear).toHaveBeenCalledWith(
          req.body.id,
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Academic year deleted successfully',
        });
      });

      it('should handle service errors', async () => {
        const req = {
          body: {
            id: 'test-academic-year-id',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        vi.mocked(adminServices.deleteAcademicYear).mockRejectedValueOnce(
          new AppError(500, 'Failed to delete academic year'),
        );

        await expect(
          adminControllers.deleteAcademicYearHandler(req as any, res as any),
        ).rejects.toThrow();
      });
    });

    describe('updateAcademicYearHandler', () => {
      it('should update academic year successfully', async () => {
        const req = {
          body: {
            id: 'test-academic-year-id',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            newClosureDate: new Date('2024-06-01'),
            finalClosureDate: new Date('2024-07-01'),
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await adminControllers.updateAcademicYearHandler(
          req as any,
          res as any,
        );

        expect(adminServices.updateAcademicYear).toHaveBeenCalledWith(
          req.body.id,
          req.body.startDate,
          req.body.endDate,
          req.body.newClosureDate,
          req.body.finalClosureDate,
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Academic year updated successfully',
        });
      });

      it('should handle service errors', async () => {
        const req = {
          body: {
            id: 'test-academic-year-id',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            newClosureDate: new Date('2024-06-01'),
            finalClosureDate: new Date('2024-07-01'),
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        vi.mocked(adminServices.updateAcademicYear).mockRejectedValueOnce(
          new AppError(500, 'Failed to update academic year'),
        );

        await expect(
          adminControllers.updateAcademicYearHandler(req as any, res as any),
        ).rejects.toThrow('Failed to update academic year');
      });
    });
  });

  describe('Term Management', () => {
    describe('createTermHandler', () => {
      it('should create term successfully', async () => {
        const req = {
          body: {
            name: 'Test Term',
            content: 'Test Content',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await adminControllers.createTermHandler(req as any, res as any);

        expect(adminServices.createTerm).toHaveBeenCalledWith(
          req.body.name,
          req.body.content,
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Term created successfully',
        });
      });

      it('should handle service errors', async () => {
        const req = {
          body: {
            name: 'Test Term',
            content: 'Test Content',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        vi.mocked(adminServices.createTerm).mockRejectedValueOnce(
          new AppError(500, 'Failed to create term'),
        );

        await expect(
          adminControllers.createTermHandler(req as any, res as any),
        ).rejects.toThrow();
      });
    });

    describe('deleteTermHandler', () => {
      it('should delete term successfully', async () => {
        const req = {
          body: {
            id: 'test-term-id',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await adminControllers.deleteTermHandler(req as any, res as any);

        expect(adminServices.deleteTerm).toHaveBeenCalledWith(req.body.id);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Term deleted successfully',
        });
      });

      it('should handle service errors', async () => {
        const req = {
          body: {
            id: 'test-term-id',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        vi.mocked(adminServices.deleteTerm).mockRejectedValueOnce(
          new AppError(500, 'Failed to delete term'),
        );

        await expect(
          adminControllers.deleteTermHandler(req as any, res as any),
        ).rejects.toThrow('Failed to delete term');
      });
    });

    describe('updateTermHandler', () => {
      it('should update term successfully', async () => {
        const req = {
          body: {
            id: 'test-term-id',
            name: 'Updated Term',
            content: 'Updated Content',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await adminControllers.updateTermHandler(req as any, res as any);

        expect(adminServices.updateTerm).toHaveBeenCalledWith(
          req.body.id,
          req.body.name,
          req.body.content,
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
          message: 'Term updated successfully',
        });
      });

      it('should handle service errors', async () => {
        const req = {
          body: {
            id: 'test-term-id',
            name: 'Updated Term',
            content: 'Updated Content',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        vi.mocked(adminServices.updateTerm).mockRejectedValueOnce(
          new AppError(500, 'Failed to update term'),
        );

        await expect(
          adminControllers.updateTermHandler(req as any, res as any),
        ).rejects.toThrow('Failed to update term');
      });
    });
  });
});
