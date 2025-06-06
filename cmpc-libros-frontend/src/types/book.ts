export interface Book {
    id: number;
    title: string;
    author: string;
    editorial: string;
    genre: string;
    price: number;
    availability: number;
  description?: string;
  isbn?: string;
  publicationDate?: string;
    imageUrl?: string;
    image?: File;
    imageFile?: File;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
  }