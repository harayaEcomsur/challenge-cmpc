import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  const mockContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: 'Bearer valid-token',
        },
      }),
      getResponse: () => ({
        status: jest.fn(),
        json: jest.fn(),
      }),
      getNext: () => jest.fn(),
    }),
    getClass: jest.fn(),
    getHandler: jest.fn(),
    getArgs: jest.fn(),
    getType: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getArgByIndex: jest.fn(),
  } as unknown as ExecutionContext;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  const mockUsersService = {
    findOneByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn().mockReturnValue(false),
          },
        },
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when no token is provided', async () => {
      const context = {
        ...mockContext,
        switchToHttp: () => ({
          getRequest: () => ({
        headers: {},
          }),
          getResponse: () => ({
            status: jest.fn(),
            json: jest.fn(),
          }),
          getNext: () => jest.fn(),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const context = {
        ...mockContext,
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer invalid-token',
            },
          }),
          getResponse: () => ({
            status: jest.fn(),
            json: jest.fn(),
          }),
          getNext: () => jest.fn(),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token format is invalid', async () => {
      const context = {
        ...mockContext,
        switchToHttp: () => ({
          getRequest: () => ({
        headers: {
              authorization: 'InvalidFormat',
            },
          }),
          getResponse: () => ({
            status: jest.fn(),
            json: jest.fn(),
          }),
          getNext: () => jest.fn(),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when request headers are null', async () => {
      const context = {
        ...mockContext,
        switchToHttp: () => ({
          getRequest: () => ({
            headers: null,
          }),
          getResponse: () => ({
            status: jest.fn(),
            json: jest.fn(),
          }),
          getNext: () => jest.fn(),
        }),
      } as unknown as ExecutionContext;

      try {
        await guard.canActivate(context);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('handleRequest', () => {
    it('should return user when valid', () => {
      const user = { id: 1, email: 'test@example.com' };
      const result = guard.handleRequest(null, user, {});
      expect(result).toBe(user);
    });

    it('should throw UnauthorizedException when no user', () => {
      expect(() => guard.handleRequest(null, null, {})).toThrow(UnauthorizedException);
    });

    it('should throw error when error exists', () => {
      const error = new Error('Test error');
      expect(() => guard.handleRequest(error, null, {})).toThrow(error);
    });

    it('should handle user with minimal properties', () => {
      const user = { id: 1 };
      const result = guard.handleRequest(null, user, {});
      expect(result).toBe(user);
    });

    it('should handle user with extended properties', () => {
      const user = { id: 1, email: 'test@example.com', name: 'Test User', role: 'admin' };
      const result = guard.handleRequest(null, user, {});
      expect(result).toBe(user);
    });
  });
}); 