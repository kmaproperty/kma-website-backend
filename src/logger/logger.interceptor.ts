import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { LoggerService } from './logger.service';
import { asyncLocalStorage } from './logger.context';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const correlationId = request.correlationId;
    const method = request.method;
    const path = request.originalUrl;
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;

    return asyncLocalStorage.run(
      {
        correlationId,
        controllerName,
        handlerName,
        path,
      },
      () => {
        this.logger.log('Request started', {
          correlationId,
          method,
          path,
          controller: controllerName,
          handler: handlerName,
        });

        return next.handle().pipe(
          tap(() => {
            const duration = Date.now() - now;
            const statusCode = response.statusCode;

            this.logger.log('Request completed', {
              correlationId,
              method,
              path,
              controller: controllerName,
              handler: handlerName,
              statusCode,
              durationMs: duration,
            });
          }),
          catchError((err) => {
            const duration = Date.now() - now;

            this.logger.error('Request failed', {
              correlationId,
              method,
              path,
              controller: controllerName,
              handler: handlerName,
              statusCode: err?.status || 500,
              durationMs: duration,
              errorMessage: err.message,
            });

            return throwError(() => err);
          }),
        );
      },
    );
  }
}
