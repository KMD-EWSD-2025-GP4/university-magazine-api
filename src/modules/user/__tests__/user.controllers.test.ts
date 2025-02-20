import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as userControllers from '../user.controllers';
import * as userServices from '../user.services';
import { AppError, UnauthorizedError } from '../../../utils/errors';

// Mock user services
vi.mock('../user.services', () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
}));

describe('User Controllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUserHandler', () => {
    it('should return current user', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        role: 'student' as const,
      };

      const req = {
        user: mockUser,
      };

      const res = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      await userControllers.getCurrentUserHandler(req as any, res as any);

      expect(res.code).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockUser);
    });

    it('should handle errors appropriately', async () => {
      const req = {
        user: undefined,
      };

      const res = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      await expect(
        userControllers.getCurrentUserHandler(req as any, res as any),
      ).rejects.toThrow(AppError);
    });
  });

  describe('registerUserHandler', () => {
    it('should register user successfully', async () => {
      const mockInput = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        facultyId: 'faculty-id',
      };

      const mockResult = {
        user: {
          id: 'test-id',
          email: mockInput.email,
          firstName: mockInput.firstName,
          lastName: mockInput.lastName,
          role: 'guest' as const,
          facultyId: mockInput.facultyId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        message: 'User registered successfully',
      };

      vi.mocked(userServices.registerUser).mockResolvedValueOnce(mockResult);

      const req = {
        body: mockInput,
      };

      const res = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      await userControllers.registerUserHandler(req as any, res as any);

      expect(userServices.registerUser).toHaveBeenCalledWith(mockInput);
      expect(res.code).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(mockResult);
    });

    it('should handle registration errors', async () => {
      const mockInput = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        facultyId: 'faculty-id',
      };

      vi.mocked(userServices.registerUser).mockRejectedValueOnce(
        new AppError(400, 'Registration failed'),
      );

      const req = {
        body: mockInput,
      };

      const res = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      await expect(
        userControllers.registerUserHandler(req as any, res as any),
      ).rejects.toThrow(AppError);
    });
  });

  describe('loginUserHandler', () => {
    it('should login user successfully', async () => {
      const mockInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResult = {
        user: {
          id: 'test-id',
          email: mockInput.email,
          firstName: 'Test',
          lastName: 'User',
          role: 'student' as const,
          facultyId: 'faculty-id',
        },
        token: 'test_token',
      };

      vi.mocked(userServices.loginUser).mockResolvedValueOnce(mockResult);

      const req = {
        body: mockInput,
      };

      const res = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      await userControllers.loginUserHandler(req as any, res as any);

      expect(userServices.loginUser).toHaveBeenCalledWith(mockInput);
      expect(res.code).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockResult);
    });

    it('should handle login errors', async () => {
      const mockInput = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      vi.mocked(userServices.loginUser).mockRejectedValueOnce(
        new UnauthorizedError('Invalid credentials'),
      );

      const req = {
        body: mockInput,
      };

      const res = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn(),
      };

      await expect(
        userControllers.loginUserHandler(req as any, res as any),
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
