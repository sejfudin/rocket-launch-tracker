import { Injectable, Module } from '@nestjs/common';
import {
  ContextIdFactory,
  DiscoveryModule,
  DiscoveryService,
  MetadataScanner,
  ModuleRef,
  Reflector,
} from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

@Injectable()
export class MetadataService {
  constructor(
    private readonly reflector: Reflector,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly moduleRef: ModuleRef,
  ) {}

  private readonly injector = new Injector();

  private getWrappers(options: { controller?: boolean; provider?: boolean }): InstanceWrapper[] {
    let wrappers: InstanceWrapper[] = [];

    if (options.controller) {
      wrappers = wrappers.concat(
        this.discoveryService.getControllers().filter((wrapper) => wrapper.instance && !wrapper.isAlias),
      );
    }

    if (options.provider) {
      wrappers = wrappers.concat(
        this.discoveryService.getProviders().filter((wrapper) => wrapper.instance && !wrapper.isAlias),
      );
    }

    return wrappers;
  }

  public *getAllMetadata<T>(
    symbol: string | symbol,
    options: {
      controller?: boolean;
      provider?: boolean;
      classMarker?: string | symbol;
    },
  ): IterableIterator<{
    metadata: T[];
    wrapper: InstanceWrapper;
    instance: Record<string, unknown>;
    methodKey: string;
  }> {
    let wrappers = this.getWrappers(options);

    if (options.classMarker) {
      wrappers = wrappers.filter((wrapper) => {
        const { instance } = wrapper;
        const constructor = instance.constructor;
        return this.reflector.get(options.classMarker!, constructor);
      });
    }

    /* oxlint-disable typescript-eslint(no-unsafe-assignment), typescript-eslint(no-unsafe-member-access) */
    for (const wrapper of wrappers) {
      const { instance } = wrapper;
      for (const methodKey of this.metadataScanner.getAllMethodNames(instance)) {
        const target = instance[methodKey];
        // Circumvent a crash that comes from reflect-metadata if it is
        // given a non-object non-function target to reflect upon.
        if (!target || (typeof target !== 'function' && typeof target !== 'object')) {
          continue;
        }
        const metadata = this.reflector.get(symbol, target);
        if (metadata) {
          yield {
            metadata: Array.isArray(metadata) ? metadata : [metadata],
            wrapper,
            instance,
            methodKey,
          };
        }
      }
    }
  }

  public *getAllHandlers<M, I extends unknown[], O>(
    symbol: string | symbol,
    options: {
      controller?: boolean;
      provider?: boolean;
      classMarker?: string | symbol;
    },
  ): IterableIterator<{
    metadata: M[];
    wrapper: InstanceWrapper;
    methodKey: string;
    handler: (...args: I) => Promise<O>;
  }> {
    for (const { metadata, wrapper, methodKey } of this.getAllMetadata(symbol, options)) {
      yield {
        metadata: metadata as M[],
        wrapper,
        methodKey,
        handler: async (...data: I) => {
          let contextInstance = wrapper.instance as Record<string, unknown>;
          if (!wrapper.isDependencyTreeStatic() && wrapper.host) {
            const contextId = ContextIdFactory.create();
            this.moduleRef.registerRequestByContextId(data, contextId);
            contextInstance = (await this.injector.loadPerContext(
              wrapper.instance,
              wrapper.host,
              wrapper.host.providers,
              contextId,
            )) as Record<string, unknown>;
          }
          const method = contextInstance[methodKey];
          if (typeof method === 'function') {
            return await method.call(contextInstance, ...data);
          }
          throw new Error(`Method ${methodKey} is not a function`);
        },
      };
    }
  }
}

@Module({
  imports: [DiscoveryModule],
  providers: [MetadataService],
  exports: [MetadataService],
})
export class MetadataModule {}
