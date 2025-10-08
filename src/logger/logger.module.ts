import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerMiddleware } from './logger.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './logger.interceptor';

@Module({
  providers: [
    LoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
