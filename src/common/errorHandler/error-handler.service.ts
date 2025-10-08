import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class ErrorHandlerService {
  constructor(private readonly logger: LoggerService) {}

  handle(error: any, context: string, meta?: Record<string, any>): never {
    const contextData = meta || {};

    if (error instanceof HttpException) {
      this.logger.error(`${context} failed (HttpException): ${error.message}`, {
        ...contextData,
        statusCode: error.getStatus(),
        stack: error.stack,
      });
      throw error;
    }

    const statusCode =
      error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      `${context} failed unexpectedly.`;

    this.logger.error(`${context} failed: ${message}`, {
      ...contextData,
      statusCode,
      stack: error.stack,
    });

    throw new HttpException(message, statusCode);
  }
}
