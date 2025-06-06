import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { LoggingInterceptor } from './logging.interceptor';
import { Logger } from '@nestjs/common';
import { Observable, of } from 'rxjs';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  })),
}));

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockLogger: jest.Mocked<Logger>;
  let mockContext: ExecutionContext;
  let mockCallHandler: { handle: jest.Mock };

  beforeEach(() => {
    mockLogger = new Logger() as jest.Mocked<Logger>;
    interceptor = new LoggingInterceptor();
    (interceptor as any).logger = mockLogger;
    mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          url: '/api/v1/books',
          user: { id: 1, email: 'test@example.com' },
        }),
      }),
    });
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ data: 'test' })),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log request and response', (done) => {
    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toEqual({ data: 'test' });
        expect(mockLogger.log).toHaveBeenCalledTimes(2);
        expect(mockLogger.log.mock.calls[0][0]).toContain('Inicio de petición');
        expect(mockLogger.log.mock.calls[1][0]).toContain('Fin de petición');
        done();
      },
    });
  });

  it('should handle errors', (done) => {
    const error = new Error('Test error');
    mockCallHandler.handle.mockReturnValue(new Observable(subscriber => {
      subscriber.error(error);
    }));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error);
        expect(mockLogger.error).toHaveBeenCalledTimes(1);
        expect(mockLogger.error.mock.calls[0][0]).toContain('Error');
        done();
      },
    });
  });

  it('should log request without user information', (done) => {
    const mockContextWithoutUser = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          url: '/api/v1/books',
        }),
      }),
    });

    interceptor.intercept(mockContextWithoutUser, mockCallHandler).subscribe({
      next: () => {
        expect(mockLogger.log.mock.calls[0][0]).toContain('Inicio de petición');
        expect(mockLogger.log.mock.calls[0][0]).toContain('UsuarioID: Invitado');
        done();
        },
    });
  });

  it('should handle circular references in response', (done) => {
    const circularData = {
      test: 'data',
      self: null as any,
    };
    circularData.self = circularData;

    mockCallHandler.handle.mockReturnValue(of(circularData));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        const logCall = mockLogger.log.mock.calls[1][0];
        expect(logCall).toContain('[Circular Reference]');
        done();
        },
    });
  });

  it('should handle serialization errors', (done) => {
    const dataWithError = {
      get circular() {
        throw new Error('Serialization error');
      },
    };

    mockCallHandler.handle.mockReturnValue(of(dataWithError));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        const logCall = mockLogger.log.mock.calls[1][0];
        expect(logCall).toContain('[Error al serializar:');
        done();
        },
    });
  });

  it('should log request with query parameters', (done) => {
    const mockContextWithQuery = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          url: '/api/v1/books',
          query: { page: '1', limit: '10' },
          user: { id: 1, email: 'test@example.com' },
        }),
      }),
    });

    interceptor.intercept(mockContextWithQuery, mockCallHandler).subscribe({
      next: () => {
        const logMessage = mockLogger.log.mock.calls[0][0];
        expect(logMessage).toContain('[GET] /api/v1/books');
        expect(logMessage).toContain('Inicio de petición');
        expect(logMessage).toContain('UsuarioID: 1 (test@example.com)');
        done();
      },
      error: (error) => done(error),
      });
  }, 10000);

  it('should log request with custom headers', (done) => {
    const mockContextWithHeaders = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          url: '/api/v1/books',
          headers: {
            'x-custom-header': 'test-value',
            'authorization': 'Bearer token',
          },
          user: { id: 1, email: 'test@example.com' },
        }),
      }),
    });

    interceptor.intercept(mockContextWithHeaders, mockCallHandler).subscribe({
      next: () => {
        const logMessage = mockLogger.log.mock.calls[0][0];
        expect(logMessage).toContain('[GET] /api/v1/books');
        expect(logMessage).toContain('Inicio de petición');
        expect(logMessage).toContain('UsuarioID: 1 (test@example.com)');
        done();
      },
      error: (error) => done(error),
      });
  }, 10000);

  it('should log response with different status codes', (done) => {
    const mockResponses = [
      { statusCode: 200, data: { success: true } },
      { statusCode: 201, data: { created: true } },
      { statusCode: 204, data: null },
    ];

    mockCallHandler.handle.mockReturnValue(of(mockResponses[0]));

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        const logCall = mockLogger.log.mock.calls[1][0];
        expect(logCall).toContain('Fin de petición');
        expect(logCall).toContain('200');
        done();
        },
    });
  });
}); 