import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: UsersService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    get: jest.fn().mockImplementation(({ plain }) => {
      if (plain) {
        return {
          id: 1,
          email: 'test@example.com',
          passwordHash: 'hashed_password',
        };
      }
      return this;
    }),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  const mockUsersService = {
    findOneByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('constructor', () => {
    it('should use fallback secret when JWT_SECRET is not set', async () => {
      mockConfigService.get.mockReturnValueOnce(undefined);
      
      const module: TestingModule = await Test.createTestingModule({
        providers: [
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

      const strategy = module.get<JwtStrategy>(JwtStrategy);
      expect(strategy).toBeDefined();
    });

    it('should configure strategy with correct options', () => {
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
    });
  });

  describe('validate', () => {
    it('should return user without password when valid', async () => {
      const payload = { email: 'test@example.com', sub: 1 };
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
      });
      expect(result.passwordHash).toBeUndefined();
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const payload = { email: 'nonexistent@example.com', sub: 1 };
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      await expect(strategy.validate(payload))
        .rejects.toThrow(UnauthorizedException);
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });

    it('should handle user with additional properties', async () => {
      const extendedUser = {
        ...mockUser,
        name: 'Test User',
        role: 'admin',
        get: jest.fn().mockImplementation(({ plain }) => {
          if (plain) {
            return {
              id: 1,
              email: 'test@example.com',
              passwordHash: 'hashed_password',
              name: 'Test User',
              role: 'admin',
            };
          }
          return this;
        }),
      };

      const payload = { email: 'test@example.com', sub: 1 };
      mockUsersService.findOneByEmail.mockResolvedValue(extendedUser);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      });
      expect(result.passwordHash).toBeUndefined();
    });

    it('should handle database errors', async () => {
      const payload = { email: 'test@example.com', sub: 1 };
      const dbError = new Error('Database connection error');
      mockUsersService.findOneByEmail.mockRejectedValue(dbError);

      await expect(strategy.validate(payload))
        .rejects.toThrow(dbError);
    });

    it('should handle invalid payload format', async () => {
      const invalidPayload = { sub: 1, email: '' }; // Invalid email
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      await expect(strategy.validate(invalidPayload))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should handle user with null properties', async () => {
      const userWithNulls = {
        ...mockUser,
        name: null,
        role: null,
        get: jest.fn().mockImplementation(({ plain }) => {
          if (plain) {
            return {
              id: 1,
              email: 'test@example.com',
              passwordHash: 'hashed_password',
              name: null,
              role: null,
            };
          }
          return this;
        }),
      };

      const payload = { email: 'test@example.com', sub: 1 };
      mockUsersService.findOneByEmail.mockResolvedValue(userWithNulls);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: null,
        role: null,
      });
      expect(result.passwordHash).toBeUndefined();
    });
  });
}); 