import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

export interface LoginDto {
  email: string;
  password_clear: string; // Nombre temporal, para que no colisione con 'password' si lo usas en User entity
}

export interface JwtPayload {
  email: string;
  sub: number; // 'sub' es el estándar para el ID de usuario en el token
}


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    this.logger.debug(`Validando usuario: ${email}`);
    const user = await this.usersService.findOneByEmail(email);
    
    if (!user) {
      this.logger.debug(`Usuario no encontrado: ${email}`);
      throw new UnauthorizedException('Usuario no encontrado');
    }
    
    this.logger.debug(`Usuario encontrado, validando contraseña para: ${email}`);
    try {
      const isValid = await user.validatePassword(pass);
      this.logger.debug(`Resultado de validación de contraseña: ${isValid}`);
      
      if (isValid) {
        const { passwordHash, ...result } = user.get({ plain: true });
        return result;
      }
      throw new UnauthorizedException('Contraseña incorrecta');
    } catch (error) {
      this.logger.error(`Error validando contraseña para ${email}: ${error.message}`);
      throw error;
    }
  }

  async login(user: any) {
    const payload: JwtPayload = { email: user.email, sub: user.id };
    this.logger.log(`Generando token para usuario ID: ${user.id}`);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Opcional: Servicio para registrar un nuevo usuario
  async register(createUserDto: LoginDto) {
    // Aquí podrías añadir validación para ver si el usuario ya existe
    const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
    if (existingUser) {
        throw new UnauthorizedException('El email ya está en uso.');
    }
    const user = await this.usersService.create(createUserDto.email, createUserDto.password_clear);
    // No devuelvas la contraseña hasheada
    const { passwordHash, ...result } = user;
    return result;
  }
}