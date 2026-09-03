/* oxlint-disable no-console */
/* oxlint-disable prefer-template */

import chalk from 'chalk';
import { DateTime } from 'luxon';

import type { IHttpResponseLog, ILog } from './interfaces';

const timeFormat = 'yyyy-LL-dd HH:mm:ss.SSS';

export function loggerConsoleFormatter(_log: ILog) {
  let level: string = _log.level ?? 'unknown';
  switch (level) {
    case 'verbose':
    case 'debug':
    case 'trace':
      level = chalk.bold(chalk.gray(level));
      break;
    case 'log':
      level = chalk.bold(level);
      break;
    case 'info':
      level = chalk.bold(chalk.blue(level));
      break;
    case 'warn':
    case 'error':
    default:
      level = chalk.bold(chalk.red(level));
      break;
  }
  switch (_log.type) {
    case 'http': {
      const log = _log as IHttpResponseLog;
      let responseCode: string = log.level ?? '-';
      switch (responseCode) {
        case 'verbose':
        case 'debug':
        case 'log':
          if (log.data.responseCode! < 300) {
            responseCode = chalk.green(log.data.responseCode!);
          } else {
            responseCode = log.data.responseCode
              ? chalk.blue(log.data.responseCode ?? '-')
              : `${log.data.responseCode || '-'}`;
          }
          break;
        default:
          responseCode = chalk.red(log.data.responseCode ?? '-');

          break;
      }
      console.log(
        `[${log.timestamp ? DateTime.fromMillis(log.timestamp).toFormat(timeFormat) : '-'}] ` +
          `${log.context} ${level} ` +
          `${log.traceId ? `${log.traceId} ` : ''}` +
          `${log.spanId ? `${log.spanId} ` : ''}` +
          `${log.data.remoteIp ?? '-'} ` +
          `${log.data.userId ?? '-'} ` +
          (log.data.responseCode ? `"${chalk.blue(log.data.requestUrl || '')}" ` : `"${log.data.requestUrl || ''}" `) +
          `${responseCode} ` +
          (log.data.responseTime ? `${log.data.responseTime}ms` : '-'),
      );
      break;
    }
    case 'query': {
      const log = _log;
      let query: string = (log.data?.query as string) ?? '';
      if (log.data?.params && Array.isArray(log.data.params)) {
        try {
          // insert actual values for easy debugging
          const params = log.data.params;
          query = query.replace(/\$[0-9]+/g, (match: string) => {
            const index = Number.parseInt(match.slice(1), 10) - 1;
            return index in params ? chalk.blue(`${params[index]}`) : match;
          });
        } catch (_e) {
          query += log.data.params.toString();
        }
      }
      const { connection, duration } = (log.data as { connection: string; duration: string }) ?? {};
      console.log(
        `[${log.timestamp ? DateTime.fromMillis(log.timestamp).toFormat(timeFormat) : '-'}] ` +
          `${log.context}${log.data?.connection === 'default' ? '' : `[${connection}]`} ${level} ` +
          `${log.traceId ? `${log.traceId} ` : ''}` +
          `${log.spanId ? `${log.spanId} ` : ''}` +
          `${duration ? `${duration}ms ` : '- '}`,
      );
      console.log(chalk.cyan(query));
      break;
    }
    default: {
      const log = _log;
      console.log(
        `[${log.timestamp ? DateTime.fromMillis(log.timestamp).toFormat(timeFormat) : '-'}] ` +
          `${log.context} ${level} ` +
          `${log.traceId ? `${log.traceId} ` : ''}` +
          `${log.spanId ? `${log.spanId} ` : ''}` +
          `${log.code ? chalk.green(log.code) + ' ' : ''}` +
          `${log.message ?? ''}`,
      );
      if (log.data) {
        console.log(log.data);
      }
      if (log.error) {
        if ('toConsole' in log.error && typeof log.error.toConsole === 'function') {
          console.log(chalk.gray((log.error as { toConsole: () => string }).toConsole()));
        } else {
          console.log(log.error);
        }
      } else if (log.stack) {
        console.log(log.stack);
      }
    }
  }
}
