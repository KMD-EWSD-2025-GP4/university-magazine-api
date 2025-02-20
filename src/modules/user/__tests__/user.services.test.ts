import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as userServices from '../user.services';
import { db } from '../../../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '../../../utils/errors';
import { env } from '../../../config/env';

// Mock external dependencies
vi.mock('../../../db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() =>
          Promise.resolve([
            {
              id: 'test-id',
              passwordHash: 'hashed_password',
              firstName: 'New',
              lastName: 'User',
              role: 'guest',
              facultyId: 'faculty-id',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
        ),
      })),
    })),
  },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => {
  const compare = vi
    .fn<(password: string, hash: string) => Promise<boolean>>()
    .mockImplementation(() => Promise.resolve(true));
  return {
    default: {
      genSalt: vi.fn(() => Promise.resolve('salt')),
      hash: vi.fn(() => Promise.resolve('hashed_password')),
      compare,
    },
  };
});

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'test_token'),
  },
}));

describe('User Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          role: 'student',
          facultyId: 'faculty-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce(mockUsers),
      } as any);

      const result = await userServices.getUsers();

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getStudentsByFaculty', () => {
    it('should return students from specific faculty', async () => {
      const facultyId = 'test-faculty-id';
      const mockStudents = [
        {
          id: '1',
          email: 'student1@example.com',
          firstName: 'Student',
          lastName: 'One',
          role: 'student',
          facultyId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce(mockStudents),
        }),
      } as any);

      const result = await userServices.getStudentsByFaculty(facultyId);

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockStudents);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const userId = 'test-user-id';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        facultyId: 'faculty-id',
      };

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([mockUser]),
          }),
        }),
      } as any);

      const result = await userServices.getUserById(userId);

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundError when user not found', async () => {
      const userId = 'non-existent-id';

      await expect(userServices.getUserById(userId)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: 'test-id',
        email,
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        facultyId: 'faculty-id',
      };

      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([mockUser]),
          }),
        }),
      } as any);

      const result = await userServices.getUserByEmail(email);

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundError when email not found', async () => {
      const email = 'nonexistent@example.com';

      await expect(userServices.getUserByEmail(email)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('registerUser', () => {
    it('should register new user successfully', async () => {
      const input = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        facultyId: 'faculty-id',
      };

      // Mock findUserByEmail to return null (user doesn't exist)
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([]),
          }),
        }),
      } as any);

      const result = await userServices.registerUser(input);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(input.password, 'salt');
      expect(db.insert).toHaveBeenCalled();
      expect(result.message).toBe('User registered successfully');
      expect(result.user).toMatchObject({
        firstName: input.firstName,
        lastName: input.lastName,
        facultyId: input.facultyId,
        role: 'guest',
      });
    });

    it('should throw ValidationError if email already exists', async () => {
      const input = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
        facultyId: 'faculty-id',
      };

      // Mock findUserByEmail to return existing user
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([{ id: 'existing-id' }]),
          }),
        }),
      } as any);

      await expect(userServices.registerUser(input)).rejects.toThrow(
        'Email already registered',
      );
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'test-id',
        email: input.email,
        passwordHash: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        facultyId: 'faculty-id',
      };

      // Mock findUserByEmail to return user
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([mockUser]),
          }),
        }),
      } as any);

      const result = await userServices.loginUser(input);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        input.password,
        mockUser.passwordHash,
      );
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result.user).toHaveProperty('email', input.email);
    });

    it('should throw UnauthorizedError if user not found', async () => {
      const input = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await expect(userServices.loginUser(input)).rejects.toThrow(
        'Invalid email or password',
      );
    });

    it('should throw UnauthorizedError if password is invalid', async () => {
      const input = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Mock findUserByEmail to return user
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValueOnce({
          where: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce([
              {
                id: 'test-id',
                passwordHash: 'hashed_password',
              },
            ]),
          }),
        }),
      } as any);

      // Mock password comparison to return false
      vi.mocked(bcrypt.compare).mockImplementationOnce(() =>
        Promise.resolve(false),
      );

      await expect(userServices.loginUser(input)).rejects.toThrow(
        'Invalid email or password',
      );
    });
  });
});
