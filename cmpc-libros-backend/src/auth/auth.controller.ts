import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Logger, UsePipes, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import { AuthService, LoginDto } from './auth.service';
// import { LocalAuthGuard } from './guards/local-auth.guard'; // Si usas estrategia local
import { User as UserModel } from '../users/entities/user.entity'; // Para tipado
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';

// DTO para el login
export class UserLoginDto {
    @ApiProperty({
        description: 'Correo electrónico del usuario',
        example: 'usuario@ejemplo.com',
        required: true
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'contraseña123',
        required: true,
        minLength: 6
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password_clear: string;
}

// DTO para el registro
export class UserRegisterDto extends UserLoginDto {}

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autentica a un usuario y retorna un token JWT.'
  })
  @ApiBody({ 
    type: UserLoginDto,
    description: 'Credenciales de acceso'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Inicio de sesión exitoso.',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Inicio de sesión exitoso.' },
        data: {
          type: 'object',
          properties: {
            access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                email: { type: 'string', example: 'usuario@ejemplo.com' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() loginDto: UserLoginDto) {
    try {
      const user = await this.authService.validateUser(loginDto.email, loginDto.password_clear);
      const result = await this.authService.login(user);
      return {
        statusCode: HttpStatus.OK,
        message: 'Inicio de sesión exitoso.',
        data: result
      };
    } catch (error) {
      this.logger.error(`Error en login: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }

  @ApiOperation({ 
    summary: 'Registrar nuevo usuario',
    description: 'Crea una nueva cuenta de usuario'
  })
  @ApiBody({ type: UserRegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Usuario registrado exitosamente' },
        userId: { type: 'number', example: 1 },
        email: { type: 'string', example: 'usuario@ejemplo.com' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() registerDto: UserRegisterDto) {
      this.logger.log(`Intento de registro para: ${registerDto.email}`);
      try {
        const user = await this.authService.register(registerDto);
        this.logger.log(`Registro exitoso para: ${user.email}`);
      return { 
        message: 'Usuario registrado exitosamente', 
        userId: user.id,
        email: user.email 
      };
      } catch (error) {
          this.logger.error(`Error en registro para ${registerDto.email}: ${error.message}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error al registrar usuario. Por favor, intente nuevamente.');
      }
  }

  // Puedes añadir un endpoint para obtener el perfil del usuario actual
  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user; // req.user es poblado por JwtStrategy
  // }
}