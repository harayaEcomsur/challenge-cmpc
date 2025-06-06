import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsUrl, Matches, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';

export class UpdateBookDto {
  @ApiProperty({ 
    required: false, 
    description: 'Título del libro',
    example: 'El Señor de los Anillos: La Comunidad del Anillo',
    type: String,
    minLength: 1,
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Nombre completo del autor del libro',
    example: 'J.R.R. Tolkien',
    type: String
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Nombre de la editorial que publicó el libro',
    example: 'Minotauro',
    type: String
  })
  @IsOptional()
  @IsString()
  editorial?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Género literario del libro',
    example: 'Fantasía',
    type: String,
    enum: ['Fantasía', 'Ciencia Ficción', 'Romance', 'Misterio', 'Aventura', 'Drama', 'Poesía', 'Ensayo']
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Precio del libro en formato decimal con hasta 2 decimales',
    example: 29.99,
    type: Number,
    format: 'float',
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiProperty({ required: false, enum: [0, 1] })
  @IsNumber()
  @IsIn([0, 1])
  @IsOptional()
  availability?: number;

  @ApiProperty({ 
    required: false, 
    description: 'URL de la imagen de portada del libro o ruta local del archivo',
    example: 'https://example.com/book-cover.jpg',
    type: String
  })
  @IsOptional()
  @IsString()
  @Matches(
    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$|^http:\/\/localhost:\d+\/uploads\/books\/[\w.-]+$|^\/uploads\/books\/[\w.-]+$/,
    { message: 'Debe ser una URL válida' }
  )
  imageUrl?: string;
}