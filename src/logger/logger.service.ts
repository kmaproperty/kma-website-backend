import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino, { Logger } from 'pino';
import { asyncLocalStorage } from './logger.context';

const isProd = process.env.NODE_ENV === 'production';

const pinoInstance: Logger = isProd
  ? pino()
  : pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      },
    });

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger = pinoInstance;

  private withContext(meta: any = {}) {
    const store = asyncLocalStorage.getStore();
    if (store) {
      return {
        ...meta,
        correlationId: store.correlationId,
        path: store.path,
        controller: store.controllerName,
        handler: store.handlerName,
      };
    }
    return meta;
  }

  log(message: string, meta: any = {}) {
    this.logger.info(this.withContext(meta), message);
  }

  error(message: string, meta: any = {}) {
    this.logger.error(this.withContext({ ...meta }), message);
  }

  warn(message: string, meta: any = {}) {
    this.logger.warn(this.withContext(meta), message);
  }

  debug(message: string, meta: any = {}) {
    this.logger.debug(this.withContext(meta), message);
  }

  verbose(message: string, meta: any = {}) {
    this.logger.trace(this.withContext(meta), message);
  }
}
