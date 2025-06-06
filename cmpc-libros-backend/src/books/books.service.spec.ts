import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getModelToken } from '@nestjs/sequelize';
import { Book } from './entities/book.entity';
import { Sequelize } from 'sequelize-typescript';
import { NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Op } from 'sequelize';
import { Model, ModelStatic } from 'sequelize-typescript';
import { FindAllBooksQueryDto } from './dto/find-all-books-query.dto';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('BooksService', () => {
  let service: BooksService;
  let mockBookModel: any;
  let mockSequelize: any;
  let mockConfigService: ConfigService;

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

  const createMockBook = (overrides = {}) => {
    const book = {
      ...baseBook,
      ...overrides,
      toJSON: jest.fn().mockReturnValue({ ...baseBook, ...overrides }),
      $add: jest.fn(),
      $set: jest.fn(),
      $get: jest.fn(),
      getDataValue: jest.fn((key: string) => ({ ...baseBook, ...overrides })[key]),
      update: jest.fn().mockImplementation(() => Promise.resolve(book)),
      destroy: jest.fn().mockImplementation(() => Promise.resolve(true)),
    } as unknown as Book & {
      update: jest.Mock;
      destroy: jest.Mock;
    };
    return book;
  };

  const mockBook = createMockBook();

  const mockCreateBookDto: CreateBookDto = {
    title: 'Test Book',
    price: 19.99,
    author: 'Test Author',
    editorial: 'Test Editorial',
    genre: 'Test Genre',
    imageUrl: 'http://localhost:3001/uploads/books/test.jpg',
    availability: 1
  };

  const mockUpdateBookDto: UpdateBookDto = {
    title: 'Updated Book',
    price: 39.99,
  };

  const mockFile = {
    fieldname: 'image',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test'),
    size: 1024,
    destination: '/tmp',
    filename: 'test.jpg',
    path: '/tmp/test.jpg'
  } as Express.Multer.File;

  beforeEach(async () => {
    mockSequelize = {
      transaction: jest.fn().mockReturnValue({
        commit: jest.fn(),
        rollback: jest.fn(),
      }),
    };

    mockBookModel = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      findAndCountAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      findByPk: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('http://localhost:3001'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getModelToken(Book),
          useValue: mockBookModel,
        },
        {
          provide: 'SEQUELIZE',
          useValue: mockSequelize,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a book successfully', async () => {
      const mockCreatedBook = {
        id: 1,
        title: 'Test Book',
        price: 19.99,
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
        imageUrl: 'http://localhost:3001/uploads/books/test.jpg',
        availability: 1,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      (mockBookModel.create as jest.Mock).mockResolvedValue(mockCreatedBook);

      const result = await service.create(mockCreateBookDto, mockFile);

      expect(result).toEqual(mockCreatedBook);
      expect(mockBookModel.create).toHaveBeenCalledWith({
        title: 'Test Book',
        price: 19.99,
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
        imageUrl: 'http://localhost:3001/uploads/books/test.jpg',
        availability: 1
      });
    });

    it('should handle transaction errors', async () => {
      (mockSequelize.transaction as jest.Mock).mockRejectedValue(new Error('Transaction failed'));
      (mockBookModel.create as jest.Mock).mockRejectedValue(new Error('Transaction failed'));

      await expect(service.create(mockCreateBookDto, mockFile))
        .rejects.toThrow('Transaction failed');
    });
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      const mockBooks = {
        items: [
          {
            id: 1,
            title: 'Test Book',
            price: 19.99,
          },
        ],
        total: 1,
        page: 1,
        limit: 10
      };

      (mockBookModel.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: mockBooks.items,
        count: mockBooks.total
      });

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toEqual(mockBooks);
      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
          where: { deletedAt: null },
          paranoid: true
        })
      );
    });

    it('should handle invalid page number', async () => {
      const mockBooks = {
        items: [],
        total: 0,
        page: -1,
        limit: 10
      };

      (mockBookModel.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });

      const result = await service.findAll({ page: -1, limit: 10 });
      expect(result).toEqual(mockBooks);
      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: -20,
        })
      );
    });

    it('should handle negative page number', async () => {
      const mockBooks = {
        items: [],
        total: 0,
        page: -2,
        limit: 10
      };

      (mockBookModel.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });

      const result = await service.findAll({ page: -2, limit: 10 });
      expect(result).toEqual(mockBooks);
      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: -30,
        })
      );
    });

    it('should handle search query', async () => {
      const mockBooks = {
        items: [
          {
            id: 1,
            title: 'Test Book',
            price: 19.99,
            author: { id: 1, name: 'Test Author' },
            editorial: { id: 1, name: 'Test Editorial' },
            genre: { id: 1, name: 'Test Genre' },
            createdAt: new Date('2025-06-04T00:33:14.650Z'),
            updatedAt: new Date('2025-06-04T00:33:14.650Z'),
          },
        ],
        total: 1,
        page: 1,
        limit: 10
      };

      (mockBookModel.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: mockBooks.items,
        count: mockBooks.total
      });

      const result = await service.findAll({ search: 'test' });
      expect(result).toEqual(mockBooks);
      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Op.or]: expect.any(Array),
          }),
        })
      );
    });

    it('should handle search query with special characters', async () => {
      const mockBooks = {
        items: [mockBook],
        total: 1,
        page: 1,
        limit: 10
      };

      (mockBookModel.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [mockBook], count: 1 });

      const result = await service.findAll({ search: 'test@#$%^&*()' });

      expect(result).toEqual(mockBooks);
      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Op.or]: expect.any(Array),
          }),
        }),
      );
    });

    it('should handle filters', async () => {
      const query: FindAllBooksQueryDto = {
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
        availability: 1,
      };

      const mockBooks = [
        createMockBook({ id: 1, title: 'Test Book 1', author: 'Test Author', price: 29.99, editorial: 'Test Editorial', genre: 'Test Genre' }),
        createMockBook({ id: 2, title: 'Test Book 2', author: 'Test Author', price: 39.99, editorial: 'Test Editorial', genre: 'Test Genre' }),
      ];

      mockBookModel.findAndCountAll.mockResolvedValue({
        rows: mockBooks,
        count: mockBooks.length,
      });

      const result = await service.findAll(query);

      expect(result.items).toEqual(mockBooks);
      expect(result.total).toBe(mockBooks.length);
      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            author: expect.any(Object),
            editorial: expect.any(Object),
            genre: expect.any(Object),
            availability: 1,
            deletedAt: null,
          }),
        }),
      );
    });

    it('should handle sortBy', async () => {
      const mockBooks = {
        items: [mockBook],
        total: 1,
        page: 1,
        limit: 10
      };

      (mockBookModel.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [mockBook], count: 1 });

      const result = await service.findAll({ sortBy: 'title:ASC,price:DESC' });

      expect(result).toEqual(mockBooks);
      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [
            ['title', 'ASC'],
            ['price', 'DESC']
          ],
        }),
      );
    });

    it('should handle multiple sort fields', async () => {
      const mockBooks = {
        items: [mockBook],
        total: 1,
        page: 1,
        limit: 10
      };

      (mockBookModel.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [mockBook], count: 1 });

      const result = await service.findAll({ sortBy: 'title:ASC,price:DESC,createdAt:ASC' });

      expect(result).toEqual(mockBooks);
      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [
            ['title', 'ASC'],
            ['price', 'DESC'],
            ['createdAt', 'ASC']
          ],
        }),
      );
    });

    it('should not return deleted books', async () => {
      const mockBooks = {
        items: [],
        total: 0,
        page: 1,
        limit: 10
      };

      (mockBookModel.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: [],
        count: 0
      });

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toEqual(mockBooks);
      expect(mockBookModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null },
          paranoid: true
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      const mockBook = createMockBook({ id: 1, title: 'Test Book', author: 'Test Author', price: 29.99, editorial: 'Test Editorial', genre: 'Test Genre' });

      mockBookModel.findOne = jest.fn().mockResolvedValue(mockBook);

      const result = await service.findOne(1);

      expect(result).toEqual(mockBook);
      expect(mockBookModel.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          deletedAt: null,
        },
        paranoid: true,
      });
    });

    it('should not return deleted book', async () => {
      mockBookModel.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      expect(mockBookModel.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          deletedAt: null,
        },
        paranoid: true,
      });
    });
  });

  describe('update', () => {
    it('should update a book successfully', async () => {
      const mockBook = createMockBook({ id: 1 });
      mockBookModel.findOne = jest.fn().mockResolvedValue(mockBook);
      mockBook.update = jest.fn().mockResolvedValue([1, [mockBook]]);

      const result = await service.update(1, mockUpdateBookDto);
      
      expect(result).toBeDefined();
      expect(mockBookModel.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          deletedAt: null,
        },
        paranoid: true,
      });
      expect(mockBook.update).toHaveBeenCalledWith(mockUpdateBookDto);
    });

    it('should throw NotFoundException when book not found', async () => {
      mockBookModel.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.update(1, mockUpdateBookDto)).rejects.toThrow(NotFoundException);
      expect(mockBookModel.findOne).toHaveBeenCalledWith({
        where: {
        id: 1,
          deletedAt: null,
        },
        paranoid: true,
      });
    });

    it('should handle error in book update', async () => {
      const mockBook = createMockBook({ id: 1 });
      mockBookModel.findOne = jest.fn().mockResolvedValue(mockBook);
      mockBook.update = jest.fn().mockRejectedValue(new Error('Update failed'));

      await expect(service.update(1, mockUpdateBookDto)).rejects.toThrow('Transaction failed');
    });
  });

  describe('remove', () => {
    it('should soft delete a book', async () => {
      const mockBook = createMockBook({ id: 1 });
      mockBookModel.findOne = jest.fn().mockResolvedValue(mockBook);
      mockBook.destroy = jest.fn().mockResolvedValue(1);

      await service.remove(1);

      expect(mockBookModel.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          deletedAt: null,
        },
        paranoid: true,
      });
      expect(mockBook.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException when book not found', async () => {
      mockBookModel.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      expect(mockBookModel.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          deletedAt: null,
        },
        paranoid: true,
      });
    });

    it('should handle error in book deletion', async () => {
      const mockBook = createMockBook({ id: 1 });
      mockBookModel.findOne = jest.fn().mockResolvedValue(mockBook);
      mockBook.destroy = jest.fn().mockRejectedValue(new Error('Delete failed'));

      await expect(service.remove(1)).rejects.toThrow('Transaction failed');
    });
  });

  describe('findAllForExport', () => {
    it('should return all books for export', async () => {
      const mockBooks = [
        {
          id: 1,
          title: 'Test Book',
          price: 19.99,
        },
      ];

      (mockBookModel.findAll as jest.Mock).mockResolvedValue(mockBooks);

      const result = await service.findAllForExport({});

      expect(result).toEqual(mockBooks);
      expect(mockBookModel.findAll).toHaveBeenCalled();
    });

    it('should handle empty sort fields', async () => {
      const mockBooks = [
        createMockBook({ id: 1, title: 'Test Book 1', author: 'Test Author', price: 29.99, editorial: 'Test Editorial', genre: 'Test Genre' }),
        createMockBook({ id: 2, title: 'Test Book 2', author: 'Test Author', price: 39.99, editorial: 'Test Editorial', genre: 'Test Genre' }),
      ];

      mockBookModel.findAll.mockResolvedValue(mockBooks);

      const result = await service.findAllForExport({});

      expect(result).toEqual(mockBooks);
      expect(mockBookModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['id', 'ASC']],
          paranoid: true,
          where: {
            deletedAt: null,
          },
        }),
      );
    });

    it('should handle search query', async () => {
      const mockBooks = [mockBook];
      (mockBookModel.findAll as jest.Mock).mockResolvedValue(mockBooks);

      const result = await service.findAllForExport({ search: 'test' });

      expect(result).toEqual(mockBooks);
      expect(mockBookModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Op.or]: expect.any(Array),
          }),
        }),
      );
    });

    it('should handle filters', async () => {
      const query: FindAllBooksQueryDto = {
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
        availability: 1,
      };

      const mockBooks = [
        createMockBook({ id: 1, title: 'Test Book 1', author: 'Test Author', price: 29.99, editorial: 'Test Editorial', genre: 'Test Genre' }),
        createMockBook({ id: 2, title: 'Test Book 2', author: 'Test Author', price: 39.99, editorial: 'Test Editorial', genre: 'Test Genre' }),
      ];

      mockBookModel.findAll.mockResolvedValue(mockBooks);

      const result = await service.findAllForExport(query);

      expect(result).toEqual(mockBooks);
      expect(mockBookModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            author: expect.any(Object),
            editorial: expect.any(Object),
            genre: expect.any(Object),
            availability: 1,
            deletedAt: null,
          }),
        }),
      );
    });

    it('should handle sortBy', async () => {
      const mockBooks = [mockBook];
      (mockBookModel.findAll as jest.Mock).mockResolvedValue(mockBooks);

      const result = await service.findAllForExport({ sortBy: 'title:ASC,price:DESC' });

      expect(result).toEqual(mockBooks);
      expect(mockBookModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [
            ['title', 'ASC'],
            ['price', 'DESC'],
          ],
        }),
      );
    });

    it('should not return deleted books in export', async () => {
      const mockBooks = [];
      (mockBookModel.findAll as jest.Mock).mockResolvedValue(mockBooks);

      const result = await service.findAllForExport({});
      expect(result).toEqual(mockBooks);
      expect(mockBookModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null },
          paranoid: true
        })
      );
    });
  });
});
