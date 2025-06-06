import { Test, TestingModule } from '@nestjs/testing';
import { TransformInterceptor } from './transform.interceptor';
import { CallHandler, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { createMock } from '@golevelup/ts-jest';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let mockContext: ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformInterceptor],
    }).compile();

    interceptor = module.get<TransformInterceptor<any>>(TransformInterceptor);

    mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          url: '/api/v1/books',
          headers: {},
          query: {},
        }),
        getResponse: () => ({
          statusCode: 200,
        }),
      }),
    });
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should transform response with pagination', () => {
      const mockResponse = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };

      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => ({
            statusCode: 200,
          }),
          getRequest: () => ({
            url: '/api/v1/books',
            method: 'GET',
            headers: {},
          }),
        }),
      };

      const mockHandler = {
      handle: () => of(mockResponse),
    };

      return interceptor
        .intercept(mockContext as any, mockHandler as any)
        .toPromise()
        .then((result) => {
        expect(result).toEqual({
          statusCode: 200,
          message: 'Operación exitosa.',
          data: mockResponse,
        });
    });
  });

    it('should transform response without pagination', () => {
      const mockResponse = { id: 1, name: 'Item 1' };

      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => ({
            statusCode: 200,
          }),
          getRequest: () => ({
            url: '/api/v1/books/1',
            method: 'GET',
            headers: {},
          }),
        }),
      };

      const mockHandler = {
        handle: () => of(mockResponse),
    };

      return interceptor
        .intercept(mockContext as any, mockHandler as any)
        .toPromise()
        .then((result) => {
          expect(result).toEqual({
            statusCode: 200,
            message: 'Operación exitosa.',
            data: mockResponse,
          });
    });
  });

    it('should handle null response', () => {
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => ({
            statusCode: 200,
          }),
          getRequest: () => ({
            url: '/api/v1/books',
            method: 'DELETE',
            headers: {},
          }),
        }),
      };

      const mockHandler = {
      handle: () => of(null),
    };

      return interceptor
        .intercept(mockContext as any, mockHandler as any)
        .toPromise()
        .then((result) => {
        expect(result).toEqual({
          statusCode: 200,
          message: 'Operación exitosa.',
          data: null,
        });
        });
    });

    it('should handle undefined response', async () => {
      const mockContext = createMock<ExecutionContext>();
      const mockResponse = undefined;

      const mockCallHandler = {
        handle: () => of(mockResponse),
      };

      const result = await new Promise((resolve) => {
        interceptor.intercept(mockContext, mockCallHandler).subscribe({
          next: (value) => resolve(value),
          error: (error) => resolve(error),
        });
      });

      expect(result).toBeUndefined();
    });

    it('should not transform CSV export response', async () => {
      const csvData = 'id,title\n1,Test Book';

      const contextWithCsv = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          url: '/api/v1/books/export/csv',
          headers: { accept: 'text/csv' },
          query: {},
        }),
          getResponse: () => ({
            statusCode: 200,
          }),
      }),
    });

      const next = {
        handle: () => of(csvData),
      } as CallHandler;

      const result = await new Promise((resolve) => {
        interceptor.intercept(contextWithCsv, next).subscribe({
          next: (value) => resolve(value),
          error: (error) => resolve(error),
    });
  });

      expect(result).toEqual(csvData);
    });

    it('should handle array response data', async () => {
      const arrayData = [1, 2, 3, 4, 5];

      const next = {
        handle: () => of(arrayData),
      } as CallHandler;

      const result = await new Promise((resolve) => {
        interceptor.intercept(mockContext, next).subscribe({
          next: (value) => resolve(value),
          error: (error) => resolve(error),
    });
  });

      expect(result).toEqual({
        statusCode: 200,
        message: 'Operación exitosa.',
        data: arrayData,
      });
    });

    it('should handle complex response data', async () => {
      const complexData = {
        id: 1,
        name: 'Test',
        nested: {
          field: 'value',
          array: [1, 2, 3],
        },
    };

      const next = {
        handle: () => of(complexData),
      } as CallHandler;

      const result = await new Promise((resolve) => {
        interceptor.intercept(mockContext, next).subscribe({
          next: (value) => resolve(value),
          error: (error) => resolve(error),
        });
      });

        expect(result).toEqual({
          statusCode: 200,
          message: 'Operación exitosa.',
        data: complexData,
      });
    });

    it('should handle error responses', async () => {
      const error = new Error('Test error');

      const next = {
        handle: () => throwError(() => error),
      } as CallHandler;

      const result = await new Promise((resolve) => {
        interceptor.intercept(mockContext, next).subscribe({
          next: (value) => resolve(value),
          error: (error) => resolve(error),
    });
  });

      expect(result).toBe(error);
    });

    it('should handle HTTP exceptions', async () => {
      const httpError = new HttpException('Not Found', HttpStatus.NOT_FOUND);

      const next = {
        handle: () => throwError(() => httpError),
      } as CallHandler;

      const result = await new Promise((resolve) => {
        interceptor.intercept(mockContext, next).subscribe({
          next: (value) => resolve(value),
          error: (error) => resolve(error),
    });
  });

      expect(result).toBe(httpError);
    });

    it('should handle validation errors', async () => {
      const validationError = new HttpException({
        message: 'Validation failed',
        errors: [
          { field: 'name', message: 'Name is required' },
          { field: 'email', message: 'Invalid email format' },
        ],
      }, HttpStatus.BAD_REQUEST);

      const next = {
        handle: () => throwError(() => validationError),
      } as CallHandler;

      const result = await new Promise((resolve) => {
        interceptor.intercept(mockContext, next).subscribe({
          next: (value) => resolve(value),
          error: (error) => resolve(error),
        });
      });

      expect(result).toBe(validationError);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      dbError.name = 'SequelizeError';

      const next = {
        handle: () => throwError(() => dbError),
      } as CallHandler;

      const result = await new Promise((resolve) => {
        interceptor.intercept(mockContext, next).subscribe({
          next: (value) => resolve(value),
          error: (error) => resolve(error),
        });
      });

      expect(result).toBe(dbError);
    });

    it('should not transform already formatted responses', async () => {
      const formattedResponse = {
        statusCode: 201,
        message: 'Recurso creado exitosamente',
        data: { id: 1, name: 'Test' }
      };

      const next = {
        handle: () => of(formattedResponse),
      } as CallHandler;

      const result = await new Promise((resolve) => {
        interceptor.intercept(mockContext, next).subscribe({
          next: (value) => resolve(value),
          error: (error) => resolve(error),
        });
      });

      expect(result).toEqual(formattedResponse);
    });

    it('should handle different HTTP status codes', async () => {
      const mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getResponse: () => ({
            statusCode: 201,
          }),
          getRequest: () => ({
            url: '/api/v1/books',
            headers: {},
          }),
        }),
      });

      const next = {
        handle: () => of({ id: 1, name: 'Test' }),
      } as CallHandler;

      const result = await new Promise((resolve) => {
        interceptor.intercept(mockContext, next).subscribe({
          next: (value) => resolve(value),
          error: (error) => resolve(error),
        });
      });

      expect(result).toEqual({
        statusCode: 201,
        message: 'Operación exitosa.',
        data: { id: 1, name: 'Test' }
      });
    });

    it('should handle different pagination formats', async () => {
      const paginationFormats = [
        {
          items: [{ id: 1 }],
          total: 1,
          page: 1,
          limit: 10
        },
        {
          rows: [{ id: 1 }],
          count: 1,
          page: 1,
          limit: 10
        },
        {
          data: [{ id: 1 }],
          total: 1,
          page: 1,
          limit: 10
        }
      ];

      for (const format of paginationFormats) {
        const next = {
          handle: () => of(format),
        } as CallHandler;

        const result = await new Promise((resolve) => {
          interceptor.intercept(mockContext, next).subscribe({
            next: (value) => resolve(value),
            error: (error) => resolve(error),
          });
        });

        expect(result).toEqual({
          statusCode: 200,
          message: 'Operación exitosa.',
          data: format
        });
      }
    });

    it('should handle different response headers', async () => {
      const headers = [
        { 'content-type': 'application/json' },
        { 'content-type': 'application/json', 'x-custom-header': 'value' },
        { 'accept': 'application/json' },
        { 'accept': 'text/csv' }
      ];

      for (const header of headers) {
        const mockContext = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getResponse: () => ({
              statusCode: 200,
            }),
            getRequest: () => ({
              url: '/api/v1/books',
              headers: header,
            }),
          }),
        });

        const next = {
          handle: () => of({ id: 1 }),
        } as CallHandler;

        const result = await new Promise((resolve) => {
          interceptor.intercept(mockContext, next).subscribe({
            next: (value) => resolve(value),
            error: (error) => resolve(error),
          });
        });

        if (header.accept === 'text/csv') {
          expect(result).toEqual({ id: 1 });
        } else {
          expect(result).toEqual({
            statusCode: 200,
            message: 'Operación exitosa.',
            data: { id: 1 }
          });
        }
      }
    });

    it('should handle CSV export with different URL patterns', async () => {
      const csvData = 'id,title\n1,Test Book';
      const csvUrls = [
        '/api/v1/books/export/csv',
        '/api/v1/books/export',
        '/api/v1/books/csv'
      ];

      for (const url of csvUrls) {
        const contextWithCsv = createMock<ExecutionContext>({
          switchToHttp: () => ({
            getRequest: () => ({
              url,
              headers: { accept: 'text/csv' },
              query: {},
            }),
            getResponse: () => ({
              statusCode: 200,
            }),
          }),
        });

        const next = {
          handle: () => of(csvData),
        } as CallHandler;

        const result = await new Promise((resolve) => {
          interceptor.intercept(contextWithCsv, next).subscribe({
            next: (value) => resolve(value),
            error: (error) => resolve(error),
          });
        });

        expect(result).toEqual(csvData);
      }
    });
  });
}); 