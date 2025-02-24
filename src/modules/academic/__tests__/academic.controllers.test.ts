import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as academicControllers from '../academic.controllers';
import * as academicServices from '../academic.services';
import { AppError } from '../../../utils/errors';

// Mock academic services
vi.mock('../academic.services', () => ({
  getAllFaculties: vi.fn(),
  getAcademicYears: vi.fn(),
  getAcademicYearById: vi.fn(),
  getAcademicYearByDate: vi.fn(),
  getTerms: vi.fn(),
  getTermById: vi.fn(),
}));

describe('Academic Controllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Faculty Management', () => {
    describe('getAllFacultiesHandler', () => {
      it('should return all faculties', async () => {
        const mockFaculties = [
          {
            id: '1',
            name: 'Faculty 1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            name: 'Faculty 2',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        vi.mocked(academicServices.getAllFaculties).mockResolvedValueOnce(
          mockFaculties,
        );

        const req = {};
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await academicControllers.getAllFacultiesHandler(
          req as any,
          res as any,
        );

        expect(academicServices.getAllFaculties).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(mockFaculties);
      });

      it('should handle service errors', async () => {
        vi.mocked(academicServices.getAllFaculties).mockRejectedValueOnce(
          new AppError(500, 'Failed to get faculties'),
        );

        const req = {};
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await expect(
          academicControllers.getAllFacultiesHandler(req as any, res as any),
        ).rejects.toThrow('Failed to get faculties');
      });
    });
  });

  describe('Academic Year Management', () => {
    describe('getAcademicYearByIdHandler', () => {
      it('should return academic year by id', async () => {
        const mockAcademicYear = [
          {
            id: 'test-id',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            newClosureDate: new Date('2024-06-01'),
            finalClosureDate: new Date('2024-07-01'),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        vi.mocked(academicServices.getAcademicYearById).mockResolvedValueOnce(
          mockAcademicYear,
        );

        const req = {
          params: {
            id: 'test-id',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await academicControllers.getAcademicYearByIdHandler(
          req as any,
          res as any,
        );

        expect(academicServices.getAcademicYearById).toHaveBeenCalledWith(
          req.params.id,
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(mockAcademicYear);
      });

      it('should handle service errors', async () => {
        const req = {
          params: {
            id: 'test-id',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        vi.mocked(academicServices.getAcademicYearById).mockRejectedValueOnce(
          new AppError(500, 'Failed to get academic year by id'),
        );

        await expect(
          academicControllers.getAcademicYearByIdHandler(
            req as any,
            res as any,
          ),
        ).rejects.toThrow('Failed to get academic year by id');
      });
    });
  });

  describe('Term Management', () => {
    describe('getTermByIdHandler', () => {
      it('should return term by id', async () => {
        const mockTerm = [
          {
            id: 'test-id',
            name: 'Test Term',
            content: 'Test Content',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        vi.mocked(academicServices.getTermById).mockResolvedValueOnce(mockTerm);

        const req = {
          params: {
            id: 'test-id',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        await academicControllers.getTermByIdHandler(req as any, res as any);

        expect(academicServices.getTermById).toHaveBeenCalledWith(
          req.params.id,
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(mockTerm);
      });

      it('should handle service errors', async () => {
        const req = {
          params: {
            id: 'test-id',
          },
        };
        const res = {
          status: vi.fn().mockReturnThis(),
          send: vi.fn(),
        };

        vi.mocked(academicServices.getTermById).mockRejectedValueOnce(
          new AppError(500, 'Failed to get term by id'),
        );

        await expect(
          academicControllers.getTermByIdHandler(req as any, res as any),
        ).rejects.toThrow('Failed to get term by id');
      });
    });
  });
});
