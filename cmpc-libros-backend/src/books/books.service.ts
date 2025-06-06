import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FindAllBooksQueryDto } from './dto/find-all-books-query.dto';
import { FindOptions, Op, WhereOptions } from 'sequelize';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { ConfigService } from '@nestjs/config';

interface BookFindOptions extends Omit<FindOptions<Book>, 'where' | 'order'> {
  where: {
    [Op.or]?: any[];
    genre?: any;
    editorial?: any;
    author?: any;
    availability?: number;
    deletedAt?: null;
  };
  order: [string, string][];
}

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    @InjectModel(Book)
    private readonly bookModel: typeof Book,
    private readonly configService: ConfigService,
  ) {}

  private getImageUrl(file: Express.Multer.File): string {
    const serverUrl = this.configService.get<string>('SERVER_URL', 'http://localhost:3001');
    return `${serverUrl}/uploads/books/${file.filename}`;
  }

  private async deleteOldImage(imageUrl: string) {
    if (imageUrl && imageUrl.startsWith('/uploads/books/')) {
      const filePath = join(process.cwd(), 'public', imageUrl);
      try {
        await unlinkSync(filePath);
      } catch (error) {
        this.logger.error(`Error deleting old image: ${error.message}`);
      }
    }
  }

  async create(createBookDto: CreateBookDto, file?: Express.Multer.File): Promise<Book> {
    const book = this.bookModel.create({
      ...createBookDto,
      price: Number(createBookDto.price),
      availability: createBookDto.availability,
      imageUrl: file ? this.getImageUrl(file) : createBookDto.imageUrl
    });
    return book;
  }

  async findAll(query: FindAllBooksQueryDto): Promise<{ items: Book[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, sortBy, sortOrder = 'ASC', ...filters } = query;
    const offset = (page - 1) * limit;

      const where: any = {
        deletedAt: null
      };

    if (search) {
        where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { editorial: { [Op.iLike]: `%${search}%` } },
        { genre: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (filters.author) {
      where.author = { [Op.iLike]: `%${filters.author}%` };
    }

    if (filters.editorial) {
      where.editorial = { [Op.iLike]: `%${filters.editorial}%` };
      }

    if (filters.genre) {
      where.genre = { [Op.iLike]: `%${filters.genre}%` };
    }

    if (filters.availability !== undefined) {
      where.availability = Number(filters.availability);
    }

    const order: [string, string][] = [];
    if (sortBy) {
      const sortFields = sortBy.split(',');
      sortFields.forEach(field => {
        const [fieldName, direction] = field.split(':');
        order.push([fieldName, direction || sortOrder]);
      });
        } else {
      order.push(['createdAt', 'DESC']);
      }

    const { rows: items, count: total } = await this.bookModel.findAndCountAll({
        where,
        order,
        limit,
      offset,
      distinct: true,
      paranoid: true
      });

      return {
      items,
      total,
      page: Number(page),
      limit: Number(limit)
    };
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookModel.findOne({
      where: {
        id,
        deletedAt: null
      },
      paranoid: true
    });
    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto, file?: Express.Multer.File): Promise<Book> {
    const book = await this.findOne(id);
    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }

    const updateData: any = { ...updateBookDto };

    if (updateData.availability !== undefined) {
      updateData.availability = Number(updateData.availability);
    }

    if (file) {
      const imageUrl = this.getImageUrl(file);
      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }
    }

    try {
      await book.update(updateData);
      return book;
    } catch (error) {
      this.logger.error(`Error updating book: ${error.message}`);
      throw new Error('Transaction failed');
    }
  }

  async remove(id: number): Promise<void> {
    const book = await this.findOne(id);
    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }

    try {
    await book.destroy();
    } catch (error) {
      this.logger.error(`Error removing book: ${error.message}`);
      throw new Error('Transaction failed');
    }
  }

  async findAllForExport(query: FindAllBooksQueryDto): Promise<Book[]> {
    const { search, sortBy, sortOrder = 'ASC', ...filters } = query;

    const where: any = {
      deletedAt: null
    };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { editorial: { [Op.iLike]: `%${search}%` } },
        { genre: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (filters.author) {
      where.author = { [Op.iLike]: `%${filters.author}%` };
    }

    if (filters.editorial) {
      where.editorial = { [Op.iLike]: `%${filters.editorial}%` };
    }

    if (filters.genre) {
      where.genre = { [Op.iLike]: `%${filters.genre}%` };
    }

    if (filters.availability !== undefined) {
      where.availability = Number(filters.availability);
    }

    const order: [string, string][] = [];
    if (sortBy) {
      const sortFields = sortBy.split(',');
      sortFields.forEach(field => {
        const [fieldName, direction] = field.split(':');
        order.push([fieldName, direction || sortOrder]);
      });
    } else {
      order.push(['id', 'ASC']);
    }

    return this.bookModel.findAll({
      where,
      order,
      paranoid: true
    });
  }
}