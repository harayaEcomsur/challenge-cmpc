import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('User Entity', () => {
  let userInstance: { passwordHash: string; validatePassword: (password: string) => Promise<boolean> };

  beforeEach(() => {
    const context = { passwordHash: '' };
    userInstance = {
      passwordHash: '',
      validatePassword: User.prototype.validatePassword.bind(context)
    };
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await User.hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });

    it('should handle hashing errors', async () => {
      const password = 'testPassword123';
      const error = new Error('Hashing failed');
      (bcrypt.hash as jest.Mock).mockRejectedValue(error);

      await expect(User.hashPassword(password)).rejects.toThrow('Hashing failed');
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const password = 'testPassword123';
      const context = { passwordHash: 'hashedPassword123' };
      const validatePassword = User.prototype.validatePassword.bind(context);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await validatePassword(password);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, context.passwordHash);
    });

    it('should return false for invalid password', async () => {
      const password = 'wrongPassword';
      const context = { passwordHash: 'hashedPassword123' };
      const validatePassword = User.prototype.validatePassword.bind(context);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await validatePassword(password);

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, context.passwordHash);
    });

    it('should return false when passwordHash is empty', async () => {
      const password = 'testPassword123';
      const context = { passwordHash: '' };
      const validatePassword = User.prototype.validatePassword.bind(context);

      const result = await validatePassword(password);

      expect(result).toBe(false);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should handle comparison errors', async () => {
      const password = 'testPassword123';
      const context = { passwordHash: 'hashedPassword123' };
      const validatePassword = User.prototype.validatePassword.bind(context);
      const error = new Error('Comparison failed');
      (bcrypt.compare as jest.Mock).mockRejectedValue(error);

      const result = await validatePassword(password);

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, context.passwordHash);
    });
  });
}); 