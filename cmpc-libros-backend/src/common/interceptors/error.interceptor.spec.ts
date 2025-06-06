import { Test, TestingModule } from '@nestjs/testing';
import { ErrorInterceptor } from './error.interceptor';
import { CallHandler, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { throwError } from 'rxjs';
import { Logger } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let mockContext: ExecutionContext;
  let mockLogger: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorInterceptor],
    }).compile();

    interceptor = module.get<ErrorInterceptor>(ErrorInterceptor);
    mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          url: '/api/v1/books',
          method: 'GET',
          headers: {},
        }),
        getResponse: () => ({
          statusCode: 200,
        }),
      }),
    });

    mockLogger = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockLogger.mockRestore();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should handle HttpException', (done) => {
    const httpException = new HttpException('Test error', HttpStatus.BAD_REQUEST);
    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => httpException),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: (error) => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Test error');
        done();
      },
    });
  });

  it('should handle SequelizeValidationError', (done) => {
    const validationError = new Error('Validation error');
    validationError.name = 'SequelizeValidationError';

    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => validationError),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: (error) => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        const response = error.getResponse() as any;
        expect(response.message).toBe('Error de validación en los datos');
        expect(mockLogger).toHaveBeenCalled();
        done();
      },
    });
  });

  it('should handle SequelizeUniqueConstraintError', (done) => {
    const uniqueError = new Error('Unique constraint error');
    uniqueError.name = 'SequelizeUniqueConstraintError';

    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => uniqueError),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: (error) => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        const response = error.getResponse() as any;
        expect(response.message).toBe('Ya existe un registro con estos datos');
        expect(mockLogger).toHaveBeenCalled();
        done();
      },
    });
  });

  it('should handle unknown errors', (done) => {
    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => new Error('Unknown error')),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: (error) => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        const response = error.getResponse() as any;
        expect(response.message).toBe('Error interno del servidor');
        expect(mockLogger).toHaveBeenCalled();
        done();
      },
    });
  });

  it('should include timestamp and path in error response', (done) => {
    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => new Error('Test error')),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: (error) => {
        const response = error.getResponse() as any;
        expect(response.timestamp).toBeDefined();
        expect(response.path).toBe('/api/v1/books');
        done();
      },
    });
  });

  it('should handle SequelizeForeignKeyConstraintError', (done) => {
    const foreignKeyError = new Error('Foreign key constraint error');
    foreignKeyError.name = 'SequelizeForeignKeyConstraintError';

    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => foreignKeyError),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: (error) => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        const response = error.getResponse() as any;
        expect(response.message).toBe('Error de referencia en los datos');
        expect(mockLogger).toHaveBeenCalled();
        done();
      },
    });
  });

  it('should handle SequelizeDatabaseError', (done) => {
    const databaseError = new Error('Database error');
    databaseError.name = 'SequelizeDatabaseError';

    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => databaseError),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: (error) => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        const response = error.getResponse() as any;
        expect(response.message).toBe('Error en la base de datos');
        expect(mockLogger).toHaveBeenCalled();
        done();
      },
    });
  });

  it('should handle SequelizeConnectionError', (done) => {
    const connectionError = new Error('Connection error');
    connectionError.name = 'SequelizeConnectionError';

    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => connectionError),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: (error) => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        const response = error.getResponse() as any;
        expect(response.message).toBe('Error de conexión con la base de datos');
        expect(mockLogger).toHaveBeenCalled();
        done();
      },
    });
  });

  it('should log error with correct format', (done) => {
    const error = new Error('Test error');
    error.stack = 'Error stack trace';

    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => error),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: () => {
        expect(mockLogger).toHaveBeenCalledWith(
          '[GET] /api/v1/books - Error 500: Error interno del servidor',
          'Error stack trace'
        );
        done();
      },
    });
  });

  it('should handle errors with different HTTP methods', (done) => {
    const methods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    const error = new Error('Test error');

    const testMethod = (method: string) => {
      const contextWithMethod = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            url: '/api/v1/books',
            method,
            headers: {},
          }),
          getResponse: () => ({
            statusCode: 200,
          }),
        }),
      });

      const mockCallHandler: CallHandler = {
        handle: () => throwError(() => error),
      };

      return new Promise((resolve) => {
        interceptor.intercept(contextWithMethod, mockCallHandler).subscribe({
          next: () => resolve(false),
          error: (err) => {
            expect(err).toBeInstanceOf(HttpException);
            expect(mockLogger).toHaveBeenCalledWith(
              `[${method}] /api/v1/books - Error 500: Error interno del servidor`,
              expect.any(String)
            );
            resolve(true);
          },
        });
      });
    };

    Promise.all(methods.map(testMethod))
      .then((results) => {
        expect(results.every(Boolean)).toBe(true);
        done();
      })
      .catch(done);
  });

  it('should handle errors with different paths', (done) => {
    const paths = ['/api/v1/books', '/api/v1/users', '/api/v1/auth'];
    const error = new Error('Test error');

    const testPath = (path: string) => {
      const contextWithPath = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            url: path,
            method: 'GET',
            headers: {},
          }),
          getResponse: () => ({
            statusCode: 200,
          }),
        }),
      });

      const mockCallHandler: CallHandler = {
        handle: () => throwError(() => error),
      };

      return new Promise((resolve) => {
        interceptor.intercept(contextWithPath, mockCallHandler).subscribe({
          next: () => resolve(false),
          error: (err) => {
            expect(err).toBeInstanceOf(HttpException);
            const response = err.getResponse() as any;
            expect(response.path).toBe(path);
            resolve(true);
          },
        });
      });
    };

    Promise.all(paths.map(testPath))
      .then((results) => {
        expect(results.every(Boolean)).toBe(true);
        done();
      })
      .catch(done);
  });

  it('should preserve original error message in HttpException', (done) => {
    const originalMessage = 'Original error message';
    const httpException = new HttpException(originalMessage, HttpStatus.BAD_REQUEST);

    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => httpException),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => done.fail('Should have thrown an error'),
      error: (error) => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(originalMessage);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        done();
      },
    });
  });
}); 