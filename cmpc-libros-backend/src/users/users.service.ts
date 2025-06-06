import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';

interface CreateUserData {
  email: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async create(email: string, password: string): Promise<User> {
    const passwordHash = await User.hashPassword(password);
    const userData: CreateUserData = { email, passwordHash };
    return this.userModel.create(userData as any);
  }

  async deleteByEmail(email: string): Promise<boolean> {
    const result = await this.userModel.destroy({
      where: { email }
    });
    return result > 0;
  }
}