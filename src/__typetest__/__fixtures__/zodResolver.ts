import { z } from 'zod';

import type { FieldValues, Resolver } from '../../types';

export declare function zodResolver<Input extends FieldValues, Context, Output>(
  schema: z.ZodSchema<Output, any, Input>,
  schemaOptions?: Partial<z.ParseParams>,
  resolverOptions?: {
    mode?: 'async' | 'sync';
    raw?: false;
  },
): Resolver<Input, Context, Output>;
// passing `resolverOptions.raw: true` you get back the input type
export declare function zodResolver<Input extends FieldValues, Context, Output>(
  schema: z.ZodSchema<Output, any, Input>,
  schemaOptions: Partial<z.ParseParams> | undefined,
  resolverOptions: {
    mode?: 'async' | 'sync';
    raw: true;
  },
): Resolver<Input, Context, Input>;
