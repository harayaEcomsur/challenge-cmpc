import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const { method, url, body, user } = context.switchToHttp().getRequest();
      const now = Date.now();
  
      // Log al inicio de la petición
      this.logger.log(
        `[${method}] ${url} - Inicio de petición${user ? ` - UsuarioID: ${user.id} (${user.email})` : ' - UsuarioID: Invitado'}`
      );
  
      if (body && Object.keys(body).length > 0) {
        this.logger.log(`Body: ${JSON.stringify(body, null, 2)}`);
      }
  
      return next.handle().pipe(
        tap({
          next: (data) => {
            const responseTime = Date.now() - now;
            const circularRefs = new WeakSet();
            
            const safeStringify = (obj: any): string => {
              try {
                return JSON.stringify(obj, (key, value) => {
                  if (typeof value === 'object' && value !== null) {
                    if (circularRefs.has(value)) {
                      return '[Circular Reference]';
                    }
                    circularRefs.add(value);
                  }
                  return value;
                }, 2);
              } catch (error) {
                return `[Error al serializar: ${error.message}]`;
              }
            };
  
            this.logger.log(
              `[${method}] ${url} - Fin de petición (${responseTime}ms)${user ? ` - UsuarioID: ${user.id} (${user.email})` : ' - UsuarioID: Invitado'}\nRespuesta: ${safeStringify(data)}`
            );
          },
          error: (error) => {
            const responseTime = Date.now() - now;
            this.logger.error(
              `[${method}] ${url} - Error (${responseTime}ms)${user ? ` - UsuarioID: ${user.id} (${user.email})` : ' - UsuarioID: Invitado'}\nError: ${error.message}`
            );
          }
        })
      );
    }
  }