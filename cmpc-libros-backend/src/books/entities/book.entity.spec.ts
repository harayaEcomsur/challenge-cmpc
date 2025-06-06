import { Test, TestingModule } from '@nestjs/testing';
import { Book } from './book.entity';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

describe('Book Entity', () => {
  let bookModel: typeof Book;
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    sequelize.addModels([Book]);
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(Book),
          useValue: Book,
        },
      ],
    }).compile();

    bookModel = module.get<typeof Book>(getModelToken(Book));
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should be defined', () => {
    expect(bookModel).toBeDefined();
  });

  describe('associations', () => {
    it('should have author field', async () => {
      const book = await Book.create({
        title: 'Test Book',
        price: 19.99,
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
      });

      expect(book.author).toBe('Test Author');
    });

    it('should have editorial field', async () => {
      const book = await Book.create({
        title: 'Test Book',
        price: 19.99,
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
      });

      expect(book.editorial).toBe('Test Editorial');
    });

    it('should have genre field', async () => {
      const book = await Book.create({
        title: 'Test Book',
        price: 19.99,
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
      });

      expect(book.genre).toBe('Test Genre');
    });
  });

  describe('validations', () => {
    it('should validate title is not empty', async () => {
      const book = new Book();
      book.title = '';
      await expect(book.validate()).rejects.toThrow();
    });

    it('should validate price is positive', async () => {
      const book = new Book();
      book.price = -10;
      await expect(book.validate()).rejects.toThrow();
    });

    it('should validate price is not null', async () => {
      const book = new Book();
      (book as any).price = undefined;
      await expect(book.validate()).rejects.toThrow();
    });

    it('should validate availability is number', async () => {
      const book = new Book();
      book.title = 'Test Book';
      book.price = 19.99;
      book.author = 'Test Author';
      book.editorial = 'Test Editorial';
      book.genre = 'Test Genre';
      book.availability = 'not-a-number' as any;
      await expect(book.validate()).rejects.toThrow();
    });

    it('should validate availability is 0 or 1', async () => {
      const book = new Book();
      book.title = 'Test Book';
      book.price = 19.99;
      book.author = 'Test Author';
      book.editorial = 'Test Editorial';
      book.genre = 'Test Genre';
      book.availability = 2;
      await expect(book.validate()).rejects.toThrow();
    });

    it('should accept availability as 0', async () => {
      const book = new Book();
      book.title = 'Test Book';
      book.price = 19.99;
      book.author = 'Test Author';
      book.editorial = 'Test Editorial';
      book.genre = 'Test Genre';
      book.availability = 0;
      await expect(book.validate()).resolves.not.toThrow();
    });

    it('should accept availability as 1', async () => {
      const book = new Book();
      book.title = 'Test Book';
      book.price = 19.99;
      book.author = 'Test Author';
      book.editorial = 'Test Editorial';
      book.genre = 'Test Genre';
      book.availability = 1;
      await expect(book.validate()).resolves.not.toThrow();
    });

    it('should validate imageUrl is valid URL', async () => {
      const book = new Book();
      book.imageUrl = 'not-a-url';
      await expect(book.validate()).rejects.toThrow();
    });

    it('should validate imageUrl is optional', async () => {
      const book = new Book();
      book.title = 'Test Book';
      book.price = 19.99;
      book.author = 'Test Author';
      book.editorial = 'Test Editorial';
      book.genre = 'Test Genre';
      book.imageUrl = undefined;
      await expect(book.validate()).resolves.not.toThrow();
    });

    it('should validate title length', async () => {
      const book = new Book();
      book.title = 'a'.repeat(256);
      book.price = 19.99;
      await expect(book.validate()).rejects.toThrow();
    });

    it('should validate price precision', async () => {
      const book = new Book();
      book.title = 'Test Book';
      book.price = 19.999;
      await expect(book.validate()).rejects.toThrow();
    });
  });

  describe('hooks', () => {
    it('should set default availability to 1 on create when undefined', async () => {
      const book = await Book.create({
        title: 'Test Book',
        price: 19.99,
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
      });
      expect(book.availability).toBe(1);
    });

    it('should not change availability on create when explicitly set to 0', async () => {
      const book = await Book.create({
        title: 'Test Book',
        price: 19.99,
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
        availability: 0,
      });
      expect(book.availability).toBe(0);
    });

    it('should not change availability on create when explicitly set to 1', async () => {
      const book = await Book.create({
        title: 'Test Book',
        price: 19.99,
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
        availability: 1,
      });
      expect(book.availability).toBe(1);
    });

    it('should set default availability to 1 on update when undefined', async () => {
      const book = await Book.create({
        title: 'Test Book',
        price: 19.99,
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
      });
      (book as any).availability = undefined;
      await book.save();
      expect(book.availability).toBe(1);
    });

    it('should not change availability on update when explicitly set to 0', async () => {
      const book = await Book.create({
        title: 'Test Book',
        price: 19.99,
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
      });
      book.availability = 0;
      await book.save();
      expect(book.availability).toBe(0);
    });

    it('should not change availability on update when explicitly set to 1', async () => {
      const book = await Book.create({
        title: 'Test Book',
        price: 19.99,
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
      });
      book.availability = 1;
      await book.save();
      expect(book.availability).toBe(1);
    });
  });

  describe('toJSON', () => {
    it('should handle null optional fields', () => {
      const book = new Book({
        id: 1,
        title: 'Test Book',
        price: 19.99,
        author: 'Test Author',
        availability: 1,
      });

      const json = book.toJSON();
      expect(json.editorial).toBeNull();
      expect(json.genre).toBeNull();
      expect(json.imageUrl).toBeNull();
      expect(json.description).toBeNull();
      expect(json.isbn).toBeNull();
      expect(json.publicationDate).toBeNull();
    });

    it('should preserve non-null optional fields', () => {
      const book = new Book({
        id: 1,
        title: 'Test Book',
        price: 19.99,
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
        imageUrl: 'http://example.com/image.jpg',
        availability: 1,
      });

      const json = book.toJSON();
      expect(json.editorial).toBe('Test Editorial');
      expect(json.genre).toBe('Test Genre');
      expect(json.imageUrl).toBe('http://example.com/image.jpg');
    });

    it('should exclude deletedAt field', () => {
      const book = new Book({
        id: 1,
        title: 'Test Book',
        price: 19.99,
        author: 'Test Author',
        availability: 1,
        deletedAt: new Date(),
      });

      const json = book.toJSON();
      expect(json.deletedAt).toBeUndefined();
    });
  });

  describe('indexes', () => {
    it('should have correct indexes defined', () => {
      const indexes = Book.options.indexes!;
      expect(indexes).toHaveLength(3);
      expect(indexes[0].name).toBe('books_title_author_idx');
      expect(indexes[0].fields).toEqual(['title', 'author']);
      expect(indexes[1].name).toBe('books_genre_availability_idx');
      expect(indexes[1].fields).toEqual(['genre', 'availability']);
      expect(indexes[2].name).toBe('books_editorial_price_idx');
      expect(indexes[2].fields).toEqual(['editorial', 'price']);
    });
  });

  describe('price validation', () => {
    it('should accept valid price with two decimal places', async () => {
      const book = new Book();
      book.title = 'Test Book';
      book.price = 19.99;
      book.author = 'Test Author';
      await expect(book.validate()).resolves.not.toThrow();
    });

    it('should accept valid price with one decimal place', async () => {
      const book = new Book();
      book.title = 'Test Book';
      book.price = 19.9;
      book.author = 'Test Author';
      await expect(book.validate()).resolves.not.toThrow();
    });

    it('should accept valid price with no decimal places', async () => {
      const book = new Book();
      book.title = 'Test Book';
      book.price = 19;
      book.author = 'Test Author';
      await expect(book.validate()).resolves.not.toThrow();
    });

    it('should reject price with more than two decimal places', async () => {
      const book = new Book();
      book.title = 'Test Book';
      book.price = 19.999;
      book.author = 'Test Author';
      await expect(book.validate()).rejects.toThrow('Price must have at most 2 decimal places');
    });
  });

  describe('instance methods', () => {
    it('should have toJSON method', () => {
      const book = new Book({
        id: 1,
        title: 'Test Book',
        price: 19.99,
        availability: 1,
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
        imageUrl: 'http://localhost:3001/uploads/books/test.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const json = book.toJSON();
      expect(json).toBeDefined();
      expect(json.id).toBe(1);
      expect(json.title).toBe('Test Book');
      expect(json.availability).toBe(1);
    });

    it('should exclude sensitive fields in toJSON', () => {
      const book = new Book({
        id: 1,
        title: 'Test Book',
        price: 19.99,
        availability: 1,
        author: 'Test Author',
        editorial: 'Test Editorial',
        genre: 'Test Genre',
        imageUrl: 'http://localhost:3001/uploads/books/test.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const json = book.toJSON();
      expect(json.deletedAt).toBeUndefined();
    });
  });
}); 