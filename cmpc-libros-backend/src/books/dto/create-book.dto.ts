import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsUrl, Min, IsISBN, IsDateString, Matches, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @ApiProperty({
    description: 'Título del libro',
    example: 'El Señor de los Anillos',
    minLength: 1,
    maxLength: 255,
    required: true,
    type: String
  })
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Nombre completo del autor del libro',
    example: 'J.R.R. Tolkien',
    required: true,
    type: String
  })
  @IsNotEmpty({ message: 'El autor no puede estar vacío.' })
  @IsString()
  author: string;

  @ApiProperty({
    description: 'Nombre de la editorial que publicó el libro',
    example: 'Minotauro',
    required: false,
    type: String
  })
  @IsString()
  @IsOptional()
  editorial?: string;

  @ApiProperty({
    description: 'Precio del libro en formato decimal con hasta 2 decimales',
    example: 29.99,
    minimum: 0,
    required: true,
    type: Number,
    format: 'float'
  })
  @IsNotEmpty({ message: 'El precio no puede estar vacío.' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número con hasta 2 decimales.'})
  @Min(0, { message: 'El precio no puede ser negativo.'})
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'Indica si el libro está disponible para venta',
    example: 1,
    required: false,
    default: 1,
    type: Number,
    enum: [0, 1]
  })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  availability?: number;

  @ApiProperty({
    description: 'Género literario del libro',
    example: 'Fantasía',
    required: false,
    type: String,
    enum: ['Fantasía', 'Ciencia Ficción', 'Romance', 'Misterio', 'Aventura', 'Drama', 'Poesía', 'Ensayo']
  })
  @IsString()
  @IsOptional()
  genre?: string;

  @ApiProperty({
    description: 'URL de la imagen de portada del libro',
    example: 'https://example.com/book-cover.jpg',
    required: false,
    format: 'uri',
    type: String
  })
  @IsOptional()
  @IsString()
  @Matches(
    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$|^http:\/\/localhost:\d+\/uploads\/books\/[\w.-]+$|^\/uploads\/books\/[\w.-]+$/,
    { message: 'Debe ser una URL válida' }
  )
  @IsOptional()
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  imageUrl?: string;

  @ApiProperty({ 
    description: 'Descripción detallada del libro',
    example: 'Una épica historia de fantasía que sigue las aventuras de Frodo Bolsón...',
    required: false,
    type: String,
    maxLength: 1000
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Número ISBN del libro (formato ISBN-10 o ISBN-13)',
    example: '978-84-450-7112-4',
    required: false,
    type: String
  })
  @IsISBN()
  @IsOptional()
  isbn?: string;

  @ApiProperty({ 
    description: 'Fecha de publicación del libro en formato ISO 8601',
    example: '2023-01-15',
    required: false,
    type: String,
    format: 'date'
  })
  @IsDateString()
  @IsOptional()
  publicationDate?: string;
}