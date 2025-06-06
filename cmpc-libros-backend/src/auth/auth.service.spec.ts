import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

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
    validatePassword: jest.fn().mockResolvedValue(true),
  };

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.passwordHash).toBeUndefined();
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUser.validatePassword).toHaveBeenCalledWith('password123');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      await expect(service.validateUser('nonexistent@example.com', 'password123'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      mockUser.validatePassword.mockResolvedValue(false);

      await expect(service.validateUser('test@example.com', 'wrong_password'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
      };

      const result = await service.login(user);

      expect(result).toEqual({
        access_token: 'test_token',
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: 1,
      });
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'new@example.com',
        password_clear: 'password123',
      };

      mockUsersService.findOneByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: 2,
        email: 'new@example.com',
      });

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.email).toBe('new@example.com');
      expect(mockUsersService.create).toHaveBeenCalledWith(
        'new@example.com',
        'password123',
      );
    });

    it('should throw UnauthorizedException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password_clear: 'password123',
      };

      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
