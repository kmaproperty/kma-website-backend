import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  correlationId: string;
  controllerName?: string;
  handlerName?: string;
  path: string;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();
