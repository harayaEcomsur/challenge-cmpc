import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  export interface Response<T> {
    statusCode: number;
    message?: string;
    data: T;
  }
  
  @Injectable()
  export class TransformInterceptor<T> implements NestInterceptor<T, Response<T | { items: T[], total: number }>> {
    intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Observable<Response<T | { items: T[], total: number }>> {
      const httpContext = context.switchToHttp();
      const response = httpContext.getResponse();
      const request = httpContext.getRequest();
  
      return next.handle().pipe(
        map(data => {
          // Para respuestas de exportación CSV, no transformar
          if (request.url.includes('/export/csv') || request.headers.accept === 'text/csv') {
              return data;
          }

          // Si la respuesta ya tiene el formato correcto, la devolvemos tal cual
          if (data && typeof data === 'object' && 'statusCode' in data && 'message' in data && 'data' in data) {
            return data;
          }
  
          // Para respuestas paginadas (como findAndCountAll)
          if (data && typeof data === 'object' && 'items' in data && 'total' in data) {
            return {
              statusCode: response.statusCode,
              message: 'Operación exitosa.',
              data
            };
          }

          // Para otras respuestas
          return {
            statusCode: response.statusCode,
            message: 'Operación exitosa.',
            data,
          };
        }),
      );
    }
  }