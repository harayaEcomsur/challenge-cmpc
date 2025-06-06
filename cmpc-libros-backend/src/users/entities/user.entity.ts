import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Unique, Index } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Index
  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare passwordHash: string;

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.passwordHash) {
      return false;
    }
    
    try {
      return await bcrypt.compare(password, this.passwordHash);
    } catch (error) {
      return false;
    }
  }
}