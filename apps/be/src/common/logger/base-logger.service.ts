// oxlint-disable-next-line no-restricted-imports
import { Global, Inject, Injectable, LogLevel, LoggerService, Optional, Scope } from '@nestjs/common';
import { isPlainObject } from '@nestjs/common/utils/shared.utils';
import { INQUIRER } from '@nestjs/core';

import { BaseLoggerConfig } from './base-logger.config';

export interface IBaseLog {
  /**
   * Log level
   *  - used for filtering, default to 'log'
   */
  level: BaseLogLevel;

  /**
   * Context of the log message
   * - usually the injector class
   */
  context?: string;

  /**
   * Type of log message
   * - used for formatting and filtering
   * - examples: metric, query, event, request, etc.
   */
  type?: string;

  /**
   * Human-readable message
   */
  message?: string;

  /**
   * Log code
   *  - used to uniquely identify the event
   */
  code?: string;

  /**
   *  Data to log
   *   - facets, metrics, etc.
   */
  data?: Record<string, unknown>;

  /**
   * Error that caused the log
   */
  error?: Error;

  /**
   * Stack trace
   * @deprecated nest.js internal
   */
  stack?: string;

  /**
   * Additional messages
   * @deprecated nest.js internal
   */
  messages?: unknown[];
}

export type BaseLogLevel = LogLevel | 'none';
export const LogLevelOrder: BaseLogLevel[] = ['none', 'fatal', 'error', 'warn', 'log', 'debug', 'verbose'];

const isStackFormat = (stack: unknown): stack is string => {
  if (!(typeof stack === 'string') && !(typeof stack === 'undefined')) {
    return false;
  }
  return /^(.)+\n\s+at .+:\d+:\d+/.test(stack as unknown as string);
};

/**
 * Generalized logger service based on the NestJS LoggerService
 *  - converts all logs into the BaseLogInstance format
 */
@Global()
@Injectable({ scope: Scope.TRANSIENT })
export class BaseLoggerService<T extends BaseLoggerConfig = BaseLoggerConfig, R = void> implements LoggerService {
  protected context?: string;

  /**
   * Log level specific for the module
   * @private
   */
  protected levels = new Set<BaseLogLevel>();

  constructor(
    /**
     * Class of the injecting service
     */
    @Inject(INQUIRER) context?: string | object,

    @Optional()
    protected options?: T,
  ) {
    this.setContext(typeof context === 'string' ? context : context?.constructor?.name);
    this.setLogLevels(LogLevelOrder.slice(0, LogLevelOrder.indexOf(this.options?.level || 'log') + 1));
  }

  /**
   * Write a log
   * @example logger.send({ data: { key: any }, type: 'metric' });
   * @example logger.send({ error: Error, level: 'error' });
   */
  send(data: Partial<IBaseLog>): R | void {
    return this._process({
      context: this.context,
      level: 'log',
      ...data,
    });
  }

  /**
   * Write a 'log' level log
   * @example logger.log('message', { key: any });
   */
  log(data: Record<string, unknown>): R;
  log(message: unknown, context?: string): R;
  log(message: unknown, data: Record<string, unknown>, context?: string): R;
  /** @deprecated nest.js internal */
  // oxlint-disable-next-line no-explicit-any
  log(message: unknown, ...optionalParams: [...any, string?]): R;
  log(message: unknown, ...optionalParams: unknown[]): R | void {
    return this._process(this._toLogInstance([message, ...optionalParams], 'log'));
  }

  /**
   * Write a 'error' level log
   * @example logger.error('message', { key: any }, Error);
   */
  error(error?: Error): R;
  error(data: Record<string, unknown>): R;
  error(message: unknown, context?: string): R;
  error(message: unknown, error?: Error, context?: string): R;
  error(message: unknown, data: Record<string, unknown>, error?: Error, context?: string): R;
  /** @deprecated nest.js internal */
  error(message: unknown, stack?: string, context?: string): R;
  // oxlint-disable-next-line no-explicit-any
  error(message: unknown, ...optionalParams: [...any, string?, string?]): R;
  error(message: unknown, ...optionalParams: unknown[]): R | void {
    return this._process(this._toLogInstanceWithErrors([message, ...optionalParams], 'error'));
  }

  /**
   * Write a 'warn' level log
   * @example logger.warn('message', { key: any });
   */
  warn(data: Record<string, unknown>): R;
  warn(message: unknown, context?: string): R;
  warn(message: unknown, data: Record<string, unknown>, context?: string): R;
  /** @deprecated nest.js internal */
  // oxlint-disable-next-line no-explicit-any
  warn(message: unknown, ...optionalParams: [...any, string?]): R;
  warn(message: unknown, ...optionalParams: unknown[]): R | void {
    return this._process(this._toLogInstance([message, ...optionalParams], 'warn'));
  }

  /**
   * Write a 'debug' level log
   * @example logger.debug('message', { key: any });
   */
  debug(data: Record<string, unknown>): R;
  debug(message: unknown, context?: string): R;
  debug(message: unknown, data: Record<string, unknown>, context?: string): R;
  /** @deprecated nest.js internal */
  // oxlint-disable-next-line no-explicit-any
  debug(message: unknown, ...optionalParams: [...any, string?]): R;
  debug(message: unknown, ...optionalParams: unknown[]): R | void {
    return this._process(this._toLogInstance([message, ...optionalParams], 'debug'));
  }

  /**
   * Write a 'verbose' level log
   * @example logger.verbose('message', { key: any });
   */
  verbose(data: Record<string, unknown>): R;
  verbose(message: unknown, context?: string): R;
  verbose(message: unknown, data: Record<string, unknown>, context?: string): R;
  /** @deprecated nest.js internal */
  // oxlint-disable-next-line no-explicit-any
  verbose(message: unknown, ...optionalParams: [...any, string?]): R;
  verbose(message: unknown, ...optionalParams: unknown[]): R | void {
    return this._process(this._toLogInstance([message, ...optionalParams], 'verbose'));
  }

  /**
   * Write a 'fatal' level log
   * @example logger.fatal('message', { key: any });
   */
  fatal(data: Record<string, unknown>): R;
  fatal(message: unknown, context?: string): R;
  fatal(message: unknown, data: Record<string, unknown>, context?: string): R;
  /** @deprecated nest.js internal */
  // oxlint-disable-next-line no-explicit-any
  fatal(message: unknown, ...optionalParams: [...any, string?]): R;
  fatal(message: unknown, ...optionalParams: unknown[]): R | void {
    return this._process(this._toLogInstance([message, ...optionalParams], 'fatal'));
  }

  /**
   * Set logger context
   *  - default to options.level or 'log'
   */
  public setContext(context?: string) {
    this.context = context;
  }

  /**
   * Set what levels of logs to enable
   */
  public setLogLevels(levels: BaseLogLevel[]) {
    this.levels = new Set(levels);
  }

  /**
   * Check if the given log level is enabled
   */
  // oxlint-disable-next-line @typescript-eslint/no-unused-vars
  public isLevelEnabled(level: BaseLogLevel, context?: string): boolean {
    return this.levels.has(level);
  }

  /**
   * Convert a nest.js like log message to a LogInstance
   * @param args - [ message?, ...messages?, data?: Record<string, any>, context?: string ]
   * @param level
   */
  protected _toLogInstance(args: unknown[], level: BaseLogLevel): IBaseLog {
    if (args?.length < 1) {
      return { context: this.context, level: level };
    }

    const instance: IBaseLog = {
      context: this.context,
      level,
    };
    if (args?.length === 1) {
      if (isPlainObject(args[0])) {
        // [data]
        instance.data = args[0] as Record<string, unknown>;
      } else if (typeof args[0] === 'string') {
        // [message]
        instance.message = args[0];
      } else {
        // unknown parameter, stringify
        instance.message = JSON.stringify(args[0]);
      }
    } else {
      if (typeof args[args.length - 1] === 'string') {
        // [..., context]
        instance.context = args.pop() as string;
      }

      if (isPlainObject(args[args.length - 1])) {
        // [..., data, context?]
        instance.data = args.pop() as Record<string, unknown>;
      }

      if (typeof args[0] === 'string') {
        // [message, ...]
        instance.message = args[0];
      }

      if (args.length > 1) {
        // [message, ...messages, ...]
        instance.messages = args.slice(1);
      }
    }
    return instance;
  }

  /**
   * Convert a nest.js like error log message to a LogInstance
   * @param args - [ message?, ...messages?, data?: Record<string, any>, error?: Error, context?: string ]
   * @param level
   */
  protected _toLogInstanceWithErrors(args: unknown[], level: BaseLogLevel): IBaseLog {
    if (args?.length < 1) {
      return { context: this.context, level: level };
    }

    const instance: IBaseLog = {
      context: this.context,
      level,
    };

    if (args?.length === 1) {
      if (args[0] instanceof Error) {
        // [error]
        instance.error = args[0];
      } else if (isStackFormat(args[0])) {
        // [stack]
        instance.stack = args[0];
      } else if (isPlainObject(args[0])) {
        // [data]
        instance.data = args[0] as Record<string, unknown>;
      } else if (typeof args[0] === 'string') {
        // [message]
        instance.message = args[0];
      } else {
        // unknown parameter, stringify
        instance.message = JSON.stringify(args[0]);
      }
    } else {
      // [..., stack|context]
      if (typeof args[args.length - 1] === 'string') {
        if (isStackFormat(args[args.length - 1])) {
          // [..., stack]
          instance.stack = args.pop() as string;
        } else {
          // [..., context]
          instance.context = args.pop() as string;
        }
      }

      if (!instance.stack) {
        if (args[args.length - 1] instanceof Error) {
          // [..., error, ...]
          instance.error = args.pop() as Error;
        } else if (isStackFormat(args[args.length - 1])) {
          // [..., stack, ...]
          instance.stack = args.pop() as string;
        }
      }

      if (isPlainObject(args[args.length - 1])) {
        // [..., data, ...]
        instance.data = args.pop() as Record<string, unknown>;
      }

      if (typeof args[0] === 'string') {
        // [message, ...]
        instance.message = args[0];
      } else if (args[0] instanceof Error) {
        // [error]
        instance.error = args[0];
        instance.message = instance.error.message;
      }

      if (args.length > 1) {
        // [message, ...messages, ...]
        instance.messages = args.slice(1);
      }
    }

    return instance;
  }

  /**
   * Process the LogInstance
   */
  protected _process(instance: IBaseLog): R | void {
    if (!this.isLevelEnabled(instance.level, instance.context)) {
      return;
    }

    // oxlint-disable-next-line no-console
    console.log(instance);
  }
}

export interface IBaseLoggerService extends BaseLoggerService {}
