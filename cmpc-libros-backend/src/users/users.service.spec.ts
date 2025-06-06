import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: typeof User;

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

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<typeof User>(getModelToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.findOneByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const newUser = {
        id: 2,
        email: 'new@example.com',
        passwordHash: 'hashed_password',
        get: jest.fn().mockImplementation(({ plain }) => {
          if (plain) {
            return {
              id: 2,
              email: 'new@example.com',
              passwordHash: 'hashed_password',
            };
          }
          return this;
        }),
      };

      mockUserModel.create.mockResolvedValue(newUser);

      const result = await service.create('new@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result.email).toBe('new@example.com');
      expect(result.passwordHash).toBeDefined();
      expect(mockUserModel.create).toHaveBeenCalled();
    });
  });

  describe('deleteByEmail', () => {
    it('should delete a user by email', async () => {
      mockUserModel.destroy.mockResolvedValue(1);

      const result = await service.deleteByEmail('test@example.com');

      expect(result).toBe(true);
      expect(mockUserModel.destroy).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return false if user not found', async () => {
      mockUserModel.destroy.mockResolvedValue(0);

      const result = await service.deleteByEmail('nonexistent@example.com');

      expect(result).toBe(false);
      expect(mockUserModel.destroy).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });
});
