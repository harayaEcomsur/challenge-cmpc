import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Sequelize } from 'sequelize-typescript';
import { Book } from '../src/books/entities/book.entity';

describe('BooksController (e2e)', () => {
  let app: INestApplication;
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    sequelize.addModels([Book]);
    await sequelize.sync({ force: true });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('SEQUELIZE')
      .useValue(sequelize)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await sequelize.close();
    await app.close();
  });

  describe('/books (POST)', () => {
    it('should create a book', () => {
      return request(app.getHttpServer())
        .post('/books')
        .send({
          title: 'Test Book',
          author: 'Test Author',
          editorial: 'Test Editorial',
          price: 29.99,
          availability: true,
          genre: 'Test Genre',
          imageUrl: 'https://example.com/book-cover.jpg',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.statusCode).toBe(201);
          expect(res.body.message).toBe('Libro creado exitosamente.');
          expect(res.body.data).toBeDefined();
          expect(res.body.data.title).toBe('Test Book');
          expect(res.body.data.author).toBe('Test Author');
          expect(res.body.data.editorial).toBe('Test Editorial');
          expect(res.body.data.price).toBe(29.99);
          expect(res.body.data.availability).toBe(true);
          expect(res.body.data.genre).toBe('Test Genre');
          expect(res.body.data.imageUrl).toBe('https://example.com/book-cover.jpg');
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/books')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body.statusCode).toBe(400);
          expect(res.body.message).toContain('title should not be empty');
          expect(res.body.message).toContain('author should not be empty');
          expect(res.body.message).toContain('price should not be empty');
        });
    });
  });

  describe('/books (GET)', () => {
    beforeEach(async () => {
      await Book.destroy({ where: {} });
      await Book.bulkCreate([
        {
          title: 'Book 1',
          author: 'Author 1',
          editorial: 'Editorial 1',
          price: 29.99,
          availability: true,
          genre: 'Genre 1',
          imageUrl: 'https://example.com/book-1.jpg',
        },
        {
          title: 'Book 2',
          author: 'Author 2',
          editorial: 'Editorial 2',
          price: 39.99,
          availability: false,
          genre: 'Genre 2',
          imageUrl: 'https://example.com/book-2.jpg',
        },
      ]);
    });

    it('should return all books with pagination', () => {
      return request(app.getHttpServer())
        .get('/books')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(2);
          expect(res.body.total).toBe(2);
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(10);
        });
    });

    it('should filter books by title', () => {
      return request(app.getHttpServer())
        .get('/books?title=Book 1')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].title).toBe('Book 1');
        });
    });

    it('should filter books by author', () => {
      return request(app.getHttpServer())
        .get('/books?author=Author 1')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].author).toBe('Author 1');
        });
    });

    it('should filter books by editorial', () => {
      return request(app.getHttpServer())
        .get('/books?editorial=Editorial 1')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].editorial).toBe('Editorial 1');
        });
    });

    it('should filter books by genre', () => {
      return request(app.getHttpServer())
        .get('/books?genre=Genre 1')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].genre).toBe('Genre 1');
        });
    });

    it('should filter books by availability', () => {
      return request(app.getHttpServer())
        .get('/books?availability=true')
        .expect(200)
        .expect((res) => {
          expect(res.body.items).toHaveLength(1);
          expect(res.body.items[0].availability).toBe(true);
        });
    });

    it('should sort books by price in ascending order', () => {
      return request(app.getHttpServer())
        .get('/books?sortBy=price&sortOrder=ASC')
        .expect(200)
        .expect((res) => {
          expect(res.body.items[0].price).toBe(29.99);
          expect(res.body.items[1].price).toBe(39.99);
        });
    });

    it('should sort books by price in descending order', () => {
      return request(app.getHttpServer())
        .get('/books?sortBy=price&sortOrder=DESC')
        .expect(200)
        .expect((res) => {
          expect(res.body.items[0].price).toBe(39.99);
          expect(res.body.items[1].price).toBe(29.99);
        });
    });
  });

  describe('/books/:id (GET)', () => {
    let testBook: Book;

    beforeEach(async () => {
      testBook = await Book.create({
        title: 'Test Book',
        author: 'Test Author',
        editorial: 'Test Editorial',
        price: 29.99,
        availability: true,
        genre: 'Test Genre',
        imageUrl: 'https://example.com/book-cover.jpg',
      });
    });

    it('should return a book by id', () => {
      return request(app.getHttpServer())
        .get(`/books/${testBook.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.statusCode).toBe(200);
          expect(res.body.message).toBe('Detalles del libro obtenidos exitosamente.');
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(testBook.id);
          expect(res.body.data.title).toBe(testBook.title);
          expect(res.body.data.author).toBe(testBook.author);
          expect(res.body.data.editorial).toBe(testBook.editorial);
          expect(res.body.data.price).toBe(testBook.price);
          expect(res.body.data.availability).toBe(testBook.availability);
          expect(res.body.data.genre).toBe(testBook.genre);
          expect(res.body.data.imageUrl).toBe(testBook.imageUrl);
        });
    });

    it('should return 404 for non-existent book', () => {
      return request(app.getHttpServer())
        .get('/books/999')
        .expect(404);
    });
  });

  describe('/books/:id (PATCH)', () => {
    let testBook: Book;

    beforeEach(async () => {
      testBook = await Book.create({
        title: 'Test Book',
        author: 'Test Author',
        editorial: 'Test Editorial',
        price: 29.99,
        availability: true,
        genre: 'Test Genre',
        imageUrl: 'https://example.com/book-cover.jpg',
      });
    });

    it('should update a book', () => {
      return request(app.getHttpServer())
        .patch(`/books/${testBook.id}`)
        .send({
          title: 'Updated Book',
          price: 39.99,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.statusCode).toBe(200);
          expect(res.body.message).toBe('Libro actualizado exitosamente.');
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(testBook.id);
          expect(res.body.data.title).toBe('Updated Book');
          expect(res.body.data.price).toBe(39.99);
          expect(res.body.data.author).toBe(testBook.author);
          expect(res.body.data.editorial).toBe(testBook.editorial);
          expect(res.body.data.availability).toBe(testBook.availability);
          expect(res.body.data.genre).toBe(testBook.genre);
          expect(res.body.data.imageUrl).toBe(testBook.imageUrl);
        });
    });

    it('should return 404 for non-existent book', () => {
      return request(app.getHttpServer())
        .patch('/books/999')
        .send({
          title: 'Updated Book',
        })
        .expect(404);
    });
  });

  describe('/books/:id (DELETE)', () => {
    let testBook: Book;

    beforeEach(async () => {
      testBook = await Book.create({
        title: 'Test Book',
        author: 'Test Author',
        editorial: 'Test Editorial',
        price: 29.99,
        availability: true,
        genre: 'Test Genre',
        imageUrl: 'https://example.com/book-cover.jpg',
      });
    });

    it('should delete a book', () => {
      return request(app.getHttpServer())
        .delete(`/books/${testBook.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.statusCode).toBe(200);
          expect(res.body.message).toBe('Libro eliminado exitosamente.');
          expect(res.body.data).toBeNull();
        });
    });

    it('should return 404 for non-existent book', () => {
      return request(app.getHttpServer())
        .delete('/books/999')
        .expect(404);
    });
  });

  describe('/books/export (GET)', () => {
    beforeEach(async () => {
      await Book.destroy({ where: {} });
      await Book.bulkCreate([
        {
          title: 'Book 1',
          author: 'Author 1',
          editorial: 'Editorial 1',
          price: 29.99,
          availability: true,
          genre: 'Genre 1',
          imageUrl: 'https://example.com/book-1.jpg',
        },
        {
          title: 'Book 2',
          author: 'Author 2',
          editorial: 'Editorial 2',
          price: 39.99,
          availability: false,
          genre: 'Genre 2',
          imageUrl: 'https://example.com/book-2.jpg',
        },
      ]);
    });

    it('should export books to CSV', () => {
      return request(app.getHttpServer())
        .get('/books/export')
        .expect(200)
        .expect('Content-Type', 'text/csv; charset=utf-8')
        .expect('Content-Disposition', 'attachment; filename=books.csv');
    });

    it('should filter exported books by title', () => {
      return request(app.getHttpServer())
        .get('/books/export?title=Book 1')
        .expect(200)
        .expect('Content-Type', 'text/csv; charset=utf-8')
        .expect('Content-Disposition', 'attachment; filename=books.csv');
    });

    it('should filter exported books by author', () => {
      return request(app.getHttpServer())
        .get('/books/export?author=Author 1')
        .expect(200)
        .expect('Content-Type', 'text/csv; charset=utf-8')
        .expect('Content-Disposition', 'attachment; filename=books.csv');
    });

    it('should filter exported books by editorial', () => {
      return request(app.getHttpServer())
        .get('/books/export?editorial=Editorial 1')
        .expect(200)
        .expect('Content-Type', 'text/csv; charset=utf-8')
        .expect('Content-Disposition', 'attachment; filename=books.csv');
    });

    it('should filter exported books by genre', () => {
      return request(app.getHttpServer())
        .get('/books/export?genre=Genre 1')
        .expect(200)
        .expect('Content-Type', 'text/csv; charset=utf-8')
        .expect('Content-Disposition', 'attachment; filename=books.csv');
    });

    it('should filter exported books by availability', () => {
      return request(app.getHttpServer())
        .get('/books/export?availability=true')
        .expect(200)
        .expect('Content-Type', 'text/csv; charset=utf-8')
        .expect('Content-Disposition', 'attachment; filename=books.csv');
    });

    it('should sort exported books by price in ascending order', () => {
      return request(app.getHttpServer())
        .get('/books/export?sortBy=price&sortOrder=ASC')
        .expect(200)
        .expect('Content-Type', 'text/csv; charset=utf-8')
        .expect('Content-Disposition', 'attachment; filename=books.csv');
    });

    it('should sort exported books by price in descending order', () => {
      return request(app.getHttpServer())
        .get('/books/export?sortBy=price&sortOrder=DESC')
        .expect(200)
        .expect('Content-Type', 'text/csv; charset=utf-8')
        .expect('Content-Disposition', 'attachment; filename=books.csv');
    });
  });
}); 