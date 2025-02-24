import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as academicServices from '../academic.services';
import { db } from '../../../db';

// Mock the database
vi.mock('../../../db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
      })),
    })),
  },
}));

describe('Academic Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllFaculties', () => {
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

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce(mockFaculties),
      } as any);

      const result = await academicServices.getAllFaculties();

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockFaculties);
    });

    it('should handle database error', async () => {
      vi.mocked(db.select).mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await expect(academicServices.getAllFaculties()).rejects.toThrow();
    });
  });

  describe('Academic Year Operations', () => {
    describe('getAcademicYears', () => {
      it('should return all academic years', async () => {
        const mockAcademicYears = [
          {
            id: '1',
            startDate: new Date(),
            endDate: new Date(),
            newClosureDate: new Date(),
            finalClosureDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        vi.mocked(db.select).mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce(mockAcademicYears),
        } as any);

        const result = await academicServices.getAcademicYears();

        expect(db.select).toHaveBeenCalled();
        expect(result).toEqual(mockAcademicYears);
      });
    });

    describe('getAcademicYearById', () => {
      it('should return academic year by id', async () => {
        const academicYearId = 'test-academic-year-id';

        await academicServices.getAcademicYearById(academicYearId);

        expect(db.select).toHaveBeenCalled();
      });

      it('should handle database error', async () => {
        vi.mocked(db.select).mockImplementationOnce(() => {
          throw new Error('Database error');
        });

        await expect(
          academicServices.getAcademicYearById('test-academic-year-id'),
        ).rejects.toThrow();
      });
    });

    describe('getAcademicYearByDate', () => {
      it('should return academic year by date', async () => {
        const mockDate = new Date();
        await academicServices.getAcademicYearByDate(mockDate);

        expect(db.select).toHaveBeenCalled();
      });
    });
  });

  describe('Term Operations', () => {
    describe('getTerms', () => {
      it('should return all terms', async () => {
        const mockTerms = [
          {
            id: '1',
            name: 'Term 1',
            content: 'Content 1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        vi.mocked(db.select).mockReturnValueOnce({
          from: vi.fn().mockReturnValueOnce(mockTerms),
        } as any);

        const result = await academicServices.getTerms();

        expect(db.select).toHaveBeenCalled();
        expect(result).toEqual(mockTerms);
      });
    });

    describe('getTermById', () => {
      it('should return term by id', async () => {
        const termId = 'test-term-id';

        await academicServices.getTermById(termId);

        expect(db.select).toHaveBeenCalled();
      });

      it('should handle database error', async () => {
        vi.mocked(db.select).mockImplementationOnce(() => {
          throw new Error('Database error');
        });

        await expect(
          academicServices.getTermById('test-term-id'),
        ).rejects.toThrow();
      });
    });
  });
});
