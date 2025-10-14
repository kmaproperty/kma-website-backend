import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

export class BaseApiResponse<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;

  data: T;
}

let wrapperCounter = 0;

/**
 * Creates a wrapper DTO with dynamic message + supports arrays
 */
export function ApiResponseWrapper<T>(
  classRef: Type<T>,
  message = 'Operation completed successfully',
  isArray = false,
): Type<BaseApiResponse<T | T[]>> {
  wrapperCounter++;
  const className = `${classRef.name}${isArray ? 'List' : ''}ApiResponse_${wrapperCounter}`;

  class ApiResponseForDto extends BaseApiResponse<T | T[]> {
    @ApiProperty({ type: classRef, isArray })
    data: T | T[];

    @ApiProperty({ example: message })
    message: string;
  }

  Object.defineProperty(ApiResponseForDto, 'name', { value: className });

  return ApiResponseForDto;
}

export interface PaginatedApiResponse<T = any> {
  success: boolean;
  message: string;
  data: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    results: T[];
  };
  error?: string;
  statusCode?: number;
}

export class ApiResponseDto {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      message: message || 'Operation completed successfully.',
      data,
    };
  }

  static error(
    message: string,
    error?: string,
    statusCode?: number,
  ): ApiResponse {
    return {
      success: false,
      message,
      error,
      statusCode,
    };
  }

  static paginated<T>(
    results: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Data fetched successfully.',
  ): PaginatedApiResponse<T> {
    return {
      success: true,
      message,
      data: {
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
        results,
      },
    };
  }
}
