import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
  };

  const mockLoginDto = {
    email: 'test@example.com',
    password_clear: 'password123',
  };

  const mockToken = {
    access_token: 'mock.jwt.token',
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a JWT token when credentials are valid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password_clear: 'password123',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue({ access_token: 'mock.jwt.token' });

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Inicio de sesión exitoso.',
        data: {
          access_token: 'mock.jwt.token'
        }
      });
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password_clear,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password_clear: 'wrongpassword',
      };

      mockAuthService.validateUser.mockRejectedValue(new UnauthorizedException('Credenciales inválidas'));

      await expect(controller.login(loginDto))
        .rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password_clear,
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException with invalid email format', async () => {
      const invalidDto = {
        email: 'invalid-email',
        password_clear: 'password123',
      };
      mockAuthService.validateUser.mockRejectedValue(new UnauthorizedException('Credenciales inválidas'));

      await expect(controller.login(invalidDto as any))
        .rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        invalidDto.email,
        invalidDto.password_clear,
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException with empty password', async () => {
      const invalidDto = {
        email: 'test@example.com',
        password_clear: '',
      };
      mockAuthService.validateUser.mockRejectedValue(new UnauthorizedException('Credenciales inválidas'));

      await expect(controller.login(invalidDto as any))
        .rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        invalidDto.email,
        invalidDto.password_clear,
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException with missing fields', async () => {
      const invalidDto = {
        email: 'test@example.com',
      };
      mockAuthService.validateUser.mockRejectedValue(new UnauthorizedException('Credenciales inválidas'));

      await expect(controller.login(invalidDto as any))
        .rejects.toThrow(UnauthorizedException);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        invalidDto.email,
        undefined,
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should handle service errors during login', async () => {
      const error = new UnauthorizedException('Service error');
      mockAuthService.validateUser.mockRejectedValue(error);

      await expect(controller.login(mockLoginDto))
        .rejects.toThrow(error);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password_clear,
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      const mockResponse = {
        userId: undefined,
        email: undefined,
        message: 'Usuario registrado exitosamente',
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await controller.register(mockLoginDto);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(mockLoginDto);
    });

    it('should handle service errors during registration', async () => {
      const error = new Error('Service error');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(mockLoginDto))
        .rejects.toThrow();
    });

    it('should validate register DTO with invalid email', async () => {
      const invalidDto = {
        email: 'invalid-email',
        password_clear: 'password123',
      };

      await expect(controller.register(invalidDto))
        .rejects.toThrow();
    });

    it('should validate register DTO with empty password', async () => {
      const invalidDto = {
        email: 'test@example.com',
        password_clear: '',
      };

      await expect(controller.register(invalidDto))
        .rejects.toThrow();
    });

    it('should validate register DTO with missing fields', async () => {
      const invalidDto = {
        email: 'test@example.com',
      };

      await expect(controller.register(invalidDto as any))
        .rejects.toThrow();
    });

    it('should handle validation pipe errors', async () => {
      const invalidDto = {
        email: 'test@example.com',
        password_clear: 'password123',
        extraField: 'should not be here',
      };

      await expect(controller.register(invalidDto as any))
        .rejects.toThrow();
    });
  });
});
