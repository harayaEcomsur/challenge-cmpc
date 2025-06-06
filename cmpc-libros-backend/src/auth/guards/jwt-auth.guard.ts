import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { // 'jwt' es el nombre por defecto de la estrategia que registramos
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers) {
      throw new UnauthorizedException('No estás autorizado para acceder a este recurso.');
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // Puedes lanzar una excepción personalizada aquí
    if (err || !user) {
      // console.error('JWT Auth Error:', info); // Para depuración
      throw err || new UnauthorizedException('No estás autorizado para acceder a este recurso.');
    }
    return user;
  }
}