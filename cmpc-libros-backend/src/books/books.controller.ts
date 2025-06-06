import {
    Controller, Get, Post, Body, Patch, Param, Delete, Query,
    ParseIntPipe, UsePipes, ValidationPipe, UseGuards, Res, Header, BadRequestException, InternalServerErrorException, Logger, UseInterceptors, HttpStatus, UploadedFile, StreamableFile, NotFoundException
  } from '@nestjs/common';
  import { BooksService } from './books.service';
  import { CreateBookDto } from './dto/create-book.dto';
  import { UpdateBookDto } from './dto/update-book.dto';
  import { FindAllBooksQueryDto } from './dto/find-all-books-query.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { Response } from 'express';
  import { stringify } from 'csv-stringify';
  import { PassThrough } from 'stream';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
  import { TransformInterceptor } from '../common/interceptors/transform.interceptor';
  import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
  import { ErrorInterceptor } from '../common/interceptors/error.interceptor';
  import { FileInterceptor } from '@nestjs/platform-express';
  
  
  @ApiTags('Libros')
  @ApiBearerAuth('JWT-auth')
  @Controller('books')
  @UseGuards(JwtAuthGuard) // Proteger todas las rutas de libros
  @UseInterceptors(TransformInterceptor, LoggingInterceptor, ErrorInterceptor)
  export class BooksController {
    private readonly logger = new Logger(BooksController.name);
  
    constructor(private readonly booksService: BooksService) {}
  
    @Post('create')
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ 
      summary: 'Crear un nuevo libro',
      description: 'Crea un nuevo libro en el sistema con la información proporcionada.'
    })
    @ApiBody({ 
      type: CreateBookDto,
      description: 'Datos del libro a crear'
    })
    @ApiResponse({ 
      status: 201, 
      description: 'Libro creado exitosamente.',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 201 },
          message: { type: 'string', example: 'Libro creado exitosamente.' },
          data: { $ref: '#/components/schemas/Book' }
        }
      }
    })
    @ApiResponse({ status: 400, description: 'Datos inválidos.' })
    async create(
      @Body() createBookDto: CreateBookDto,
      @UploadedFile() file: Express.Multer.File
    ) {
      try {
        const book = await this.booksService.create(createBookDto, file);
        return {
          statusCode: HttpStatus.CREATED,
          message: 'Libro creado exitosamente.',
          data: book
        };
      } catch (error) {
        this.logger.error(`Error al crear libro: ${error.message}`, error.stack);
        throw new BadRequestException(error.message);
      }
    }
  
    @Get('list')
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({ 
      summary: 'Obtener lista de libros',
      description: 'Retorna una lista paginada de libros con opciones de filtrado.'
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Lista de libros obtenida exitosamente.',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Lista de libros obtenida exitosamente.' },
          data: {
            type: 'object',
            properties: {
              items: { type: 'array', items: { $ref: '#/components/schemas/Book' } },
              total: { type: 'number', example: 10 },
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 }
            }
          }
        }
      }
    })
    async findAll(@Query() query: FindAllBooksQueryDto) {
      try {
        return await this.booksService.findAll(query);
      } catch (error) {
        this.logger.error(`Error al obtener libros: ${error.message}`, error.stack);
        throw new BadRequestException(error.message);
      }
    }
  
    @Get('details/:id')
    @ApiOperation({ 
      summary: 'Obtener detalles de un libro',
      description: 'Retorna los detalles completos de un libro específico.'
    })
    @ApiParam({ 
      name: 'id', 
      type: 'number',
      description: 'ID del libro a consultar'
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Detalles del libro obtenidos exitosamente.',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Operación exitosa.' },
          data: { $ref: '#/components/schemas/Book' }
        }
      }
    })
    @ApiResponse({ status: 404, description: 'Libro no encontrado.' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
      try {
        const book = await this.booksService.findOne(id);
        return {
          statusCode: HttpStatus.OK,
          message: 'Detalles del libro obtenidos exitosamente.',
          data: book
        };
      } catch (error) {
        this.logger.error(`Error al obtener libro ${id}: ${error.message}`, error.stack);
        if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
          throw error;
        }
        throw new BadRequestException(error.message);
    }
    }
  
    @Patch('update/:id')
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ 
      summary: 'Actualizar un libro existente',
      description: 'Actualiza la información de un libro existente.'
    })
    @ApiParam({ 
      name: 'id', 
      description: 'ID del libro a actualizar',
      type: 'number'
    })
    @ApiBody({ 
      type: UpdateBookDto,
      description: 'Datos del libro a actualizar'
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Libro actualizado exitosamente.',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Libro actualizado exitosamente.' },
          data: { $ref: '#/components/schemas/Book' }
        }
      }
    })
    @ApiResponse({ status: 400, description: 'Datos inválidos.' })
    @ApiResponse({ status: 404, description: 'Libro no encontrado.' })
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateBookDto: UpdateBookDto,
      @UploadedFile() file: Express.Multer.File
    ) {
      try {
        const book = await this.booksService.update(id, updateBookDto, file);
        return {
          statusCode: HttpStatus.OK,
          message: 'Libro actualizado exitosamente.',
          data: book
        };
      } catch (error) {
        this.logger.error(`Error al actualizar libro ${id}: ${error.message}`, error.stack);
        if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
          throw error;
        }
        throw new BadRequestException(error.message);
      }
    }
  
    @Delete('remove/:id')
    @ApiOperation({ 
      summary: 'Eliminar un libro',
      description: 'Elimina un libro del sistema.'
    })
    @ApiParam({ 
      name: 'id', 
      type: 'number',
      description: 'ID del libro a eliminar'
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Libro eliminado exitosamente.',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Libro eliminado exitosamente.' },
          data: { type: 'null' }
        }
      }
    })
    @ApiResponse({ status: 404, description: 'Libro no encontrado.' })
    async remove(@Param('id', ParseIntPipe) id: number) {
      try {
        await this.booksService.remove(id);
        return {
          statusCode: HttpStatus.OK,
          message: 'Libro eliminado exitosamente.',
          data: null
        };
      } catch (error) {
        this.logger.error(`Error al eliminar libro ${id}: ${error.message}`, error.stack);
        if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
          throw error;
        }
        throw new BadRequestException(error.message);
      }
    }
  
    @Get('export/csv')
    @ApiOperation({ 
      summary: 'Exportar libros a CSV',
      description: 'Exporta la lista de libros a un archivo CSV.'
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Archivo CSV generado exitosamente.',
      content: {
        'text/csv': {
          schema: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    })
    async exportToCsv(@Query() query: FindAllBooksQueryDto, @Res() res: Response) {
      try {
        const books = await this.booksService.findAllForExport(query);
  
        if (!books || books.length === 0) {
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename=books.csv');
        res.write('\ufeff');
          res.end();
          return;
        }
  
        const stringifier = stringify({
          header: true,
          columns: {
            id: 'ID',
            title: 'Título',
            author: 'Autor',
            editorial: 'Editorial',
            genre: 'Género',
            price: 'Precio',
            availability: 'Disponibilidad',
            imageUrl: 'URL de Imagen',
            createdAt: 'Fecha de Creación',
            updatedAt: 'Fecha de Actualización'
          }
        });

        const passThrough = new PassThrough();
        
        passThrough.on('error', (error) => {
          this.logger.error(`Error en el stream de exportación: ${error.message}`, error.stack);
          throw new InternalServerErrorException('Error interno del servidor');
        });

        stringifier.pipe(passThrough);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=books.csv');
        res.write('\ufeff');

        for (const book of books) {
          stringifier.write(book);
        }

        stringifier.end();
        passThrough.pipe(res);
      } catch (error) {
        this.logger.error(`Error al exportar libros: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Error interno del servidor');
      }
    }
  }