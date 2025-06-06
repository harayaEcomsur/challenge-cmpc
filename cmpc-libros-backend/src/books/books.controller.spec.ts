import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FindAllBooksQueryDto } from './dto/find-all-books-query.dto';
import { Response } from 'express';
import { Express } from 'express';
import { PassThrough } from 'stream';
import { stringify } from 'csv-stringify';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Book } from './entities/book.entity';
import { Sequelize } from 'sequelize-typescript';
import * as stream from 'stream';
import * as csvStringify from 'csv-stringify';
import { Readable } from 'stream';
import { createObjectCsvStringifier } from 'csv-writer';
import { ExecutionContext } from '@nestjs/common';

jest.mock('csv-stringify');

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;
  let mockBooksService: jest.Mocked<BooksService>;
  let sequelize: Sequelize;

  const mockFile = {
    fieldname: 'image',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test'),
    size: 1024,
    destination: '/tmp',
    filename: 'test.jpg',
    path: '/tmp/test.jpg',
    stream: new Readable()
  } as Express.Multer.File;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    sequelize.addModels([Book]);
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  const createMockBook = (overrides = {}) => {
    const baseBook = {
      id: 1,
      title: 'Test Book',
      author: 'Test Author',
      price: 29.99,
      editorial: 'Test Editorial',
      genre: 'Test Genre',
      availability: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    };

    return {
      ...baseBook,
      ...overrides,
      toJSON: jest.fn().mockReturnValue({ ...baseBook, ...overrides }),
      $add: jest.fn(),
      $set: jest.fn(),
      $get: jest.fn(),
      getDataValue: jest.fn((key: string) => ({ ...baseBook, ...overrides })[key]),
    } as unknown as Book;
  };

  beforeEach(async () => {
    mockBooksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAllForExport: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a book', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        author: 'Test Author',
        price: 29.99,
        editorial: 'Test Editorial',
        genre: 'Test Genre',
      };

      const mockFile = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '/uploads',
        filename: 'test.jpg',
        path: '/uploads/test.jpg',
        size: 1024,
        buffer: Buffer.from('test'),
        stream: new Readable(),
      } as unknown as Express.Multer.File;

      const mockBook = createMockBook();

      mockBooksService.create.mockResolvedValue(mockBook);

      const result = await controller.create(createBookDto, mockFile);

      expect(result).toEqual({
        statusCode: 201,
        message: 'Libro creado exitosamente.',
        data: mockBook,
      });
      expect(mockBooksService.create).toHaveBeenCalledWith(createBookDto, mockFile);
    });

    it('should handle service errors', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        author: 'Test Author',
        price: 29.99,
        editorial: 'Test Editorial',
        genre: 'Test Genre',
      };

      const mockFile = {
        filename: 'test.jpg',
        path: '/uploads/test.jpg',
      } as Express.Multer.File;

      mockBooksService.create.mockRejectedValue(new Error('Service error'));

      await expect(controller.create(createBookDto, mockFile)).rejects.toThrow('Service error');
    });
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      const query: FindAllBooksQueryDto = {
        page: 1,
        limit: 10,
      };

      const mockBooks = [
        createMockBook({ id: 1, title: 'Test Book 1', author: 'Test Author', price: 29.99, editorial: 'Test Editorial', genre: 'Test Genre' }),
        createMockBook({ id: 2, title: 'Test Book 2', author: 'Test Author', price: 39.99, editorial: 'Test Editorial', genre: 'Test Genre' }),
      ];

      mockBooksService.findAll.mockResolvedValue({
        items: mockBooks,
        total: mockBooks.length,
        page: query.page || 0,
        limit: query.limit || 10,
      });

      const result = await controller.findAll(query);

      expect(result.items).toEqual(mockBooks);
      expect(result.total).toBe(mockBooks.length);
      expect(result.page).toBe(query.page);
      expect(result.limit).toBe(query.limit);
    });

    it('should handle service errors', async () => {
      const query: FindAllBooksQueryDto = {};

      mockBooksService.findAll.mockRejectedValue(new Error('Service error'));

      await expect(controller.findAll(query)).rejects.toThrow('Service error');
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      const mockBook = createMockBook();

      mockBooksService.findOne.mockResolvedValue(mockBook);

      const result = await controller.findOne(1);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Detalles del libro obtenidos exitosamente.',
        data: mockBook,
      });
      expect(mockBooksService.findOne).toHaveBeenCalledWith(1);
    });

    it('should handle not found', async () => {
      mockBooksService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should handle service errors', async () => {
      mockBooksService.findOne.mockRejectedValue(new Error('Service error'));

      await expect(controller.findOne(1)).rejects.toThrow('Service error');
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      const updateDto: UpdateBookDto = {
        title: 'Updated Book',
        price: 39.99,
      };

      const mockFile = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: '/uploads',
        filename: 'test.jpg',
        path: '/uploads/test.jpg',
        size: 1024,
        buffer: Buffer.from('test'),
        stream: new Readable(),
      } as unknown as Express.Multer.File;

      const mockBook = createMockBook({
        title: 'Updated Book',
        price: 39.99,
      });

      mockBooksService.update.mockResolvedValue(mockBook);

      const result = await controller.update(1, updateDto, mockFile);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Libro actualizado exitosamente.',
        data: mockBook,
      });
      expect(mockBooksService.update).toHaveBeenCalledWith(1, updateDto, mockFile);
    });

    it('should handle not found', async () => {
      const updateDto: UpdateBookDto = {
        title: 'Updated Book',
      };

      const mockFile = {
        filename: 'test.jpg',
        path: '/uploads/test.jpg',
      } as Express.Multer.File;

      mockBooksService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(999, updateDto, mockFile)).rejects.toThrow(NotFoundException);
    });

    it('should handle service errors', async () => {
      const updateDto: UpdateBookDto = {
        title: 'Updated Book',
      };

      const mockFile = {
        filename: 'test.jpg',
        path: '/uploads/test.jpg',
      } as Express.Multer.File;

      mockBooksService.update.mockRejectedValue(new Error('Service error'));

      await expect(controller.update(1, updateDto, mockFile)).rejects.toThrow('Service error');
    });
  });

  describe('remove', () => {
    it('should remove a book', async () => {
      mockBooksService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockBooksService.remove).toHaveBeenCalledWith(1);
    });

    it('should handle not found', async () => {
      mockBooksService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should handle service errors', async () => {
      mockBooksService.remove.mockRejectedValue(new Error('Service error'));

      await expect(controller.remove(1)).rejects.toThrow('Service error');
    });
  });

  describe('exportToCsv', () => {
    it('should export books to CSV', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        sendStatus: jest.fn().mockReturnThis(),
        links: jest.fn().mockReturnThis(),
        location: jest.fn().mockReturnThis(),
        redirect: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        sendFile: jest.fn().mockReturnThis(),
        download: jest.fn().mockReturnThis(),
        contentType: jest.fn().mockReturnThis(),
        format: jest.fn().mockReturnThis(),
        attachment: jest.fn().mockReturnThis(),
        app: jest.fn().mockReturnThis(),
        locals: {},
        charset: 'utf-8',
        headersSent: false,
        statusCode: 200,
      } as unknown as Response;

      const query: FindAllBooksQueryDto = {
        page: 0,
        limit: 10,
        search: '',
      };

      await controller.exportToCsv(query, mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=books.csv',
      );
      expect(mockResponse.write).toHaveBeenCalled();
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it('should handle stream errors', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        write: jest.fn().mockImplementation(() => {
          throw new Error('Stream error');
        }),
        end: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        sendStatus: jest.fn().mockReturnThis(),
        links: jest.fn().mockReturnThis(),
        location: jest.fn().mockReturnThis(),
        redirect: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        sendFile: jest.fn().mockReturnThis(),
        download: jest.fn().mockReturnThis(),
        contentType: jest.fn().mockReturnThis(),
        format: jest.fn().mockReturnThis(),
        attachment: jest.fn().mockReturnThis(),
        app: jest.fn().mockReturnThis(),
        locals: {},
        charset: 'utf-8',
        headersSent: false,
        statusCode: 200,
      } as unknown as Response;

      const query: FindAllBooksQueryDto = {
        page: 0,
        limit: 10,
        search: '',
      };

      await expect(controller.exportToCsv(query, mockResponse)).rejects.toThrow('Error interno del servidor');
    });

    it('should handle service errors', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        sendStatus: jest.fn().mockReturnThis(),
        links: jest.fn().mockReturnThis(),
        location: jest.fn().mockReturnThis(),
        redirect: jest.fn().mockReturnThis(),
        render: jest.fn().mockReturnThis(),
        sendFile: jest.fn().mockReturnThis(),
        download: jest.fn().mockReturnThis(),
        contentType: jest.fn().mockReturnThis(),
        format: jest.fn().mockReturnThis(),
        attachment: jest.fn().mockReturnThis(),
        app: jest.fn().mockReturnThis(),
        locals: {},
        charset: 'utf-8',
        headersSent: false,
        statusCode: 200,
      } as unknown as Response;

      const query: FindAllBooksQueryDto = {
        page: 0,
        limit: 10,
        search: '',
      };

      mockBooksService.findAllForExport.mockRejectedValueOnce(new Error('Service error'));

      await expect(controller.exportToCsv(query, mockResponse)).rejects.toThrow('Error interno del servidor');
    });
  });
});

