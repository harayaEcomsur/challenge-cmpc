import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsBoolean, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FindAllBooksQueryDto {
  @ApiProperty({ 
    required: false, 
    description: 'Número de página para la paginación',
    example: 1,
    minimum: 1,
    default: 1,
    type: Number
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  page?: number = 0;

  @ApiProperty({ 
    required: false, 
    description: 'Cantidad de registros por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    type: Number
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ 
    required: false, 
    description: 'Término de búsqueda para filtrar por título, autor o descripción',
    example: 'señor anillos',
    type: String
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Filtrar libros por género literario',
    example: 'Fantasía',
    type: String,
    enum: ['Fantasía', 'Ciencia Ficción', 'Romance', 'Misterio', 'Aventura', 'Drama', 'Poesía', 'Ensayo']
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Filtrar libros por nombre del autor',
    example: 'Tolkien',
    type: String
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Filtrar libros por nombre de la editorial',
    example: 'Minotauro',
    type: String
  })
  @IsOptional()
  @IsString()
  editorial?: string;

  @ApiProperty({
    description: 'Filtrar por disponibilidad',
    required: false,
    type: Number,
    enum: [0, 1]
  })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  availability?: number;

  @ApiProperty({ 
    required: false, 
    description: 'Campo por el cual ordenar los resultados',
    example: 'title',
    type: String,
    enum: ['title', 'author', 'price', 'publicationDate']
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ 
    required: false, 
    description: 'Orden de clasificación (ascendente o descendente)',
    example: 'asc',
    type: String,
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
} 