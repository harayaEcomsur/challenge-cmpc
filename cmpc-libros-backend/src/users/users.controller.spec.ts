import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    deleteByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deleteUser', () => {
    it('should return success message when user is deleted', async () => {
      const email = 'test@example.com';
      mockUsersService.deleteByEmail.mockResolvedValue(true);

      const result = await controller.deleteUser(email);

      expect(result).toEqual({
        message: `Usuario ${email} eliminado exitosamente`,
      });
      expect(mockUsersService.deleteByEmail).toHaveBeenCalledWith(email);
    });

    it('should return not found message when user does not exist', async () => {
      const email = 'nonexistent@example.com';
      mockUsersService.deleteByEmail.mockResolvedValue(false);

      const result = await controller.deleteUser(email);

      expect(result).toEqual({
        message: `Usuario ${email} no encontrado`,
      });
      expect(mockUsersService.deleteByEmail).toHaveBeenCalledWith(email);
    });

    it('should handle invalid email format', async () => {
      const email = 'invalid-email';
      mockUsersService.deleteByEmail.mockRejectedValue(new BadRequestException('Formato de email inválido'));

      await expect(controller.deleteUser(email)).rejects.toThrow(BadRequestException);
      expect(mockUsersService.deleteByEmail).toHaveBeenCalledWith(email);
    });

    it('should handle service errors', async () => {
      const email = 'test@example.com';
      mockUsersService.deleteByEmail.mockRejectedValue(new InternalServerErrorException('Error interno del servidor'));

      await expect(controller.deleteUser(email)).rejects.toThrow(InternalServerErrorException);
      expect(mockUsersService.deleteByEmail).toHaveBeenCalledWith(email);
    });

    it('should handle empty email', async () => {
      const email = '';
      mockUsersService.deleteByEmail.mockRejectedValue(new BadRequestException('Email no puede estar vacío'));

      await expect(controller.deleteUser(email)).rejects.toThrow(BadRequestException);
      expect(mockUsersService.deleteByEmail).toHaveBeenCalledWith(email);
    });
  });
}); 