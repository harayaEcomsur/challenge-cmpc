import { Controller, Delete, Param, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Usuarios')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Delete(':email')
  @ApiOperation({ 
    summary: 'Borrar usuario',
    description: 'Elimina un usuario de la base de datos.'
  })
  async deleteUser(@Param('email') email: string) {
    this.logger.log(`Intentando eliminar usuario: ${email}`);
    const deleted = await this.usersService.deleteByEmail(email);
    if (deleted) {
      return { message: `Usuario ${email} eliminado exitosamente` };
    }
    return { message: `Usuario ${email} no encontrado` };
  }
} 