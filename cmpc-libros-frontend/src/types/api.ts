export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export interface PaginatedData<T> {
    items: T[];
    total: number;
    page?: number;
    limit?: number;
}