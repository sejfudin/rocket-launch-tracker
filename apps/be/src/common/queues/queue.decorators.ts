import { extendArrayMetadata } from '@nestjs/common/utils/extend-metadata.util';

import { type IQueueProcessor, QUEUE_PROCESSOR_CLASS_MARKER, QUEUE_PROCESSOR_METADATA } from './models';

/**
 * Mark method as a queue processor
 */
export function RegisterProcessor(name: string, options?: Partial<IQueueProcessor>): MethodDecorator;
export function RegisterProcessor(options: Partial<IQueueProcessor>): MethodDecorator;
export function RegisterProcessor(
  input1: string | Partial<IQueueProcessor>,
  input2?: Partial<IQueueProcessor>,
): MethodDecorator {
  const input: Partial<IQueueProcessor> = typeof input1 === 'string' ? { ...input2, name: input1 } : input1;

  const decoratorFactory = (target: object, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (descriptor && typeof descriptor.value === 'function') {
      extendArrayMetadata(QUEUE_PROCESSOR_METADATA, [{ queue: 'default', ...input }], descriptor.value);
      Reflect.defineMetadata(QUEUE_PROCESSOR_CLASS_MARKER, true, target.constructor);
    }
    return descriptor;
  };
  decoratorFactory.KEY = QUEUE_PROCESSOR_METADATA;
  return decoratorFactory;
}
