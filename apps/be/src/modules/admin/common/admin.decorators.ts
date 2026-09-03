import { Controller, type ControllerOptions, applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ADMIN_REST_PREFIX } from './admin.constants';

export function AdminController(
  pathOrOptions?: string | string[] | ControllerOptions,
  options?: { prefix?: string; tags?: string[] | string },
) {
  const tags = options?.tags ? (Array.isArray(options?.tags) ? options?.tags : [options?.tags]) : [];
  const decorators: ClassDecorator[] = tags ? [ApiTags(...tags)] : [];

  const prefix = options?.prefix ?? `${ADMIN_REST_PREFIX}/`;

  if (typeof pathOrOptions === 'string') {
    pathOrOptions = prefix + pathOrOptions;
  } else if (Array.isArray(pathOrOptions)) {
    pathOrOptions = pathOrOptions.map((p) => prefix + p);
  } else {
    const path = Array.isArray(pathOrOptions?.path)
      ? pathOrOptions?.path.map((p) => prefix + p)
      : (pathOrOptions?.path ?? '');

    pathOrOptions = {
      path,
      ...pathOrOptions,
    };
  }

  return applyDecorators(
    //
    Controller(pathOrOptions as ControllerOptions),
    ...decorators,
  );
}
