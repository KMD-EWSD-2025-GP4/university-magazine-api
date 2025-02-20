import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as adminServices from '../admin.services';
import { db } from '../../../db';
import bcrypt from 'bcryptjs';

// Mock the database
vi.mock('../../../db', () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(() => Promise.resolve('hashedPassword')),
  },
}));

describe('Admin Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('resetUserPassword', () => {
    it('should hash password and update user', async () => {
      const userId = 'test-user-id';
      const newPassword = 'newPassword123';

      await adminServices.resetUserPassword(userId, newPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(db.update).toHaveBeenCalled();
    });

    it('should handle database error', async () => {
      const userId = 'test-user-id';
      const newPassword = 'newPassword123';

      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await expect(
        adminServices.resetUserPassword(userId, newPassword),
      ).rejects.toThrow();
    });
  });

  describe('changeUserRole', () => {
    it('should update user role', async () => {
      const userId = 'test-user-id';
      const newRole = 'admin' as const;

      await adminServices.changeUserRole(userId, newRole);

      expect(db.update).toHaveBeenCalled();
    });

    it('should handle database error', async () => {
      const userId = 'test-user-id';
      const newRole = 'admin' as const;

      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await expect(
        adminServices.changeUserRole(userId, newRole),
      ).rejects.toThrow();
    });
  });

  describe('createFaculty', () => {
    it('should create new faculty', async () => {
      const facultyName = 'Test Faculty';

      await adminServices.createFaculty(facultyName);

      expect(db.insert).toHaveBeenCalled();
    });

    it('should handle database error', async () => {
      vi.mocked(db.insert).mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await expect(
        adminServices.createFaculty('Test Faculty'),
      ).rejects.toThrow();
    });
  });

  describe('updateFaculty', () => {
    it('should update faculty name', async () => {
      const facultyId = 'test-faculty-id';
      const newName = 'Updated Faculty Name';

      await adminServices.updateFaculty(facultyId, newName);

      expect(db.update).toHaveBeenCalled();
    });

    it('should handle database error', async () => {
      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await expect(
        adminServices.updateFaculty('test-faculty-id', 'Updated Faculty Name'),
      ).rejects.toThrow();
    });
  });

  describe('deleteFaculty', () => {
    it('should delete faculty', async () => {
      const facultyId = 'test-faculty-id';

      await adminServices.deleteFaculty(facultyId);

      expect(db.delete).toHaveBeenCalled();
    });

    it('should handle database error', async () => {
      vi.mocked(db.delete).mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await expect(
        adminServices.deleteFaculty('test-faculty-id'),
      ).rejects.toThrow();
    });
  });

  describe('Academic Year Operations', () => {
    const mockDate = new Date('2024-01-01');
    const mockClosureDate = new Date('2024-06-01');
    const mockFinalClosureDate = new Date('2024-07-01');

    describe('createAcademicYear', () => {
      it('should create new academic year', async () => {
        await adminServices.createAcademicYear(
          mockDate,
          mockDate,
          mockClosureDate,
          mockFinalClosureDate,
        );

        expect(db.insert).toHaveBeenCalled();
      });

      it('should handle database error', async () => {
        vi.mocked(db.insert).mockImplementationOnce(() => {
          throw new Error('Database error');
        });

        await expect(
          adminServices.createAcademicYear(
            mockDate,
            mockDate,
            mockClosureDate,
            mockFinalClosureDate,
          ),
        ).rejects.toThrow();
      });
    });

    describe('updateAcademicYear', () => {
      it('should update academic year', async () => {
        const academicYearId = 'test-academic-year-id';

        await adminServices.updateAcademicYear(
          academicYearId,
          mockDate,
          mockDate,
          mockClosureDate,
          mockFinalClosureDate,
        );

        expect(db.update).toHaveBeenCalled();
      });

      it('should handle database error', async () => {
        vi.mocked(db.update).mockImplementationOnce(() => {
          throw new Error('Database error');
        });

        await expect(
          adminServices.updateAcademicYear(
            'test-academic-year-id',
            mockDate,
            mockDate,
            mockClosureDate,
            mockFinalClosureDate,
          ),
        ).rejects.toThrow();
      });
    });

    describe('deleteAcademicYear', () => {
      it('should delete academic year', async () => {
        const academicYearId = 'test-academic-year-id';

        await adminServices.deleteAcademicYear(academicYearId);

        expect(db.delete).toHaveBeenCalled();
      });
    });
  });

  describe('Term Operations', () => {
    describe('createTerm', () => {
      it('should create new term', async () => {
        const termName = 'Test Term';
        const termContent = 'Test Content';

        await adminServices.createTerm(termName, termContent);

        expect(db.insert).toHaveBeenCalled();
      });

      it('should handle database error', async () => {
        vi.mocked(db.insert).mockImplementationOnce(() => {
          throw new Error('Database error');
        });

        await expect(
          adminServices.createTerm('Test Term', 'Test Content'),
        ).rejects.toThrow();
      });
    });

    describe('updateTerm', () => {
      it('should update term', async () => {
        const termId = 'test-term-id';
        const newName = 'Updated Term';
        const newContent = 'Updated Content';

        await adminServices.updateTerm(termId, newName, newContent);

        expect(db.update).toHaveBeenCalled();
      });

      it('should handle database error', async () => {
        vi.mocked(db.update).mockImplementationOnce(() => {
          throw new Error('Database error');
        });

        await expect(
          adminServices.updateTerm(
            'test-term-id',
            'Updated Term',
            'Updated Content',
          ),
        ).rejects.toThrow();
      });
    });

    describe('deleteTerm', () => {
      it('should delete term', async () => {
        const termId = 'test-term-id';

        await adminServices.deleteTerm(termId);

        expect(db.delete).toHaveBeenCalled();
      });

      it('should handle database error', async () => {
        vi.mocked(db.delete).mockImplementationOnce(() => {
          throw new Error('Database error');
        });

        await expect(
          adminServices.deleteTerm('test-term-id'),
        ).rejects.toThrow();
      });
    });
  });
});
