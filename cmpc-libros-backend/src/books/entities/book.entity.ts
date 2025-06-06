import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Index, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';

@Table({
  tableName: 'books',
  timestamps: true,
  paranoid: true,   
  indexes: [
    {
      name: 'books_title_author_idx',
      fields: ['title', 'author'],
    },
    {
      name: 'books_genre_availability_idx',
      fields: ['genre', 'availability'],
    },
    {
      name: 'books_editorial_price_idx',
      fields: ['editorial', 'price'],
    },
  ],
})
export class Book extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  })
  declare title: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  })
  declare author: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare editorial: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  declare genre: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true,
      customValidator(value: number) {
        if (value === null || value === undefined) {
          throw new Error('Price is required');
        }
        const decimalPlaces = value.toString().split('.')[1]?.length || 0;
        if (decimalPlaces > 2) {
          throw new Error('Price must have at most 2 decimal places');
        }
      }
    }
  })
  declare price: number;

  @Index
  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
    validate: {
      isIn: [[0, 1]]
    }
  })
  declare availability: number;

  @Column({
    type: DataType.STRING,
    allowNull: true
  }) 
  declare imageUrl?: string;

  @BeforeCreate
  static setDefaults(instance: Book) {
    if (instance.availability === undefined) {
      instance.availability = 1;
    }
  }

  @BeforeUpdate
  static setDefaultsOnUpdate(instance: Book) {
    if (instance.availability === undefined) {
      instance.availability = 1;
    }
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.deletedAt;
    if (!values.editorial) values.editorial = null;
    if (!values.genre) values.genre = null;
    if (!values.imageUrl) values.imageUrl = null;
    if (!values.description) values.description = null;
    if (!values.isbn) values.isbn = null;
    if (!values.publicationDate) values.publicationDate = null;
    return values;
  }
}