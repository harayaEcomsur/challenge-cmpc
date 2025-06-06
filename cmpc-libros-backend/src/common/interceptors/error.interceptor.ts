import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    return next.handle().pipe(
      catchError(error => {
        const timestamp = new Date().toISOString();
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Error interno del servidor';
        let errorType = 'Internal Server Error';

        if (error instanceof HttpException) {
          return throwError(() => error);
        } else if (error.name === 'SequelizeValidationError') {
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Error de validación en los datos';
          errorType = 'Validation Error';
        } else if (error.name === 'SequelizeUniqueConstraintError') {
          statusCode = HttpStatus.CONFLICT;
          message = 'Ya existe un registro con estos datos';
          errorType = 'Conflict Error';
        } else if (error.name === 'SequelizeForeignKeyConstraintError') {
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Error de referencia en los datos';
          errorType = 'Foreign Key Error';
        } else if (error.name === 'SequelizeDatabaseError') {
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Error en la base de datos';
          errorType = 'Database Error';
        } else if (error.name === 'SequelizeConnectionError') {
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Error de conexión con la base de datos';
          errorType = 'Connection Error';
        }

        const errorResponse: ErrorResponse = {
          statusCode,
          message,
          error: errorType,
          timestamp,
          path,
        };

        this.logger.error(
          `[${request.method}] ${path} - Error ${statusCode}: ${message}`,
          error.stack,
        );

        return throwError(() => new HttpException(errorResponse, statusCode));
      }),
    );
  }
} 