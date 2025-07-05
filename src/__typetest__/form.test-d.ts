import { expectType } from 'tsd';
import { z } from 'zod';

import type { FieldError, FieldValues, Resolver } from '../types';
import { useForm } from '../useForm';

/** {@link UseFormHandleSubmit} */ {
  /** it should infer the correct defaultValues from useForm */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { handleSubmit } = useForm({
      defaultValues: {
        test: '',
        test1: 2,
      },
    });

    handleSubmit((data) => expectType<{ test: string; test1: number }>(data));
  }

  /** it should infer the correct defaultValues from useForm generic */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { handleSubmit } = useForm<{
      test: string;
      test1: number;
    }>();

    handleSubmit((data) => expectType<{ test: string; test1: number }>(data));
  }
}

/** it should infer the correct TTransformedValues from useForm resolver */ {
  /* eslint-disable react-hooks/rules-of-hooks */
  const { handleSubmit } = useForm({
    resolver: mockZodResolver(
      z.object({
        test: z.string(),
        test1: z.number(),
      }),
    ),
  });

  handleSubmit((data) => {
    expectType<{
      test: string;
      test1: number;
    }>(data);
  });
}

const schema = z.object({
  id: z.number(),
});

/** it should correctly infer the output type from a schema */ {
  /* eslint-disable react-hooks/rules-of-hooks */
  const form = useForm({
    resolver: mockZodResolver(schema),
  });

  expectType<number | undefined>(form.watch('id'));

  form.handleSubmit((data) => {
    expectType<{ id: number }>(data);
  });
}

/** it should correctly infer the output type from a schema */ {
  /* eslint-disable react-hooks/rules-of-hooks */
  const form = useForm({
    resolver: mockZodResolver(schema),
  });

  expectType<number>(form.watch('id', 4711));

  form.handleSubmit((data) => {
    expectType<{ id: number }>(data);
  });
}

/** it should correctly infer the output type from a schema */ {
  /* eslint-disable react-hooks/rules-of-hooks */
  const form = useForm({
    resolver: mockZodResolver(schema),
  });

  expectType<number | undefined>(form.watch('id', undefined));

  form.handleSubmit((data) => {
    expectType<{ id: number }>(data);
  });
}

/** it should correctly infer the output type from a zod schema with a transform */ {
  /* eslint-disable react-hooks/rules-of-hooks */
  const form = useForm({
    resolver: mockZodResolver(
      z.object({ id: z.number().transform((val) => String(val)) }),
    ),
  });

  form.handleSubmit((data) => {
    expectType<{ id: string }>(data);
  });
}

/** it should infer the correct TTransformedValues from useForm generic */ {
  /* eslint-disable react-hooks/rules-of-hooks */
  const { handleSubmit } = useForm<
    { test: string },
    unknown,
    { test: string } | { test1: number }
  >();

  handleSubmit((data) => {
    // @ts-expect-error `data` should be union and thus should not be assignable to `{ test: string }`
    expectType<{ test: string }>(data);
    // @ts-expect-error `data` should be union and thus should not be assignable to `{ test1: number }`
    expectType<{ test1: number }>(data);
    expectType<{ test: string } | { test1: number }>(data);
  });
}

/** {@link UseFormGetFieldState} */ {
  /** it should return associated field state */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { getFieldState } = useForm({
      defaultValues: {
        test: '',
      },
    });

    expectType<{
      invalid: boolean;
      isDirty: boolean;
      isTouched: boolean;
      isValidating: boolean;
      error?: FieldError;
    }>(getFieldState('test'));
  }

  /** it should return associated field state when formState is supplied */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { getFieldState, formState } = useForm({
      defaultValues: {
        test: '',
      },
    });

    expectType<{
      invalid: boolean;
      isDirty: boolean;
      isTouched: boolean;
      isValidating: boolean;
      error?: FieldError;
    }>(getFieldState('test', formState));
  }
}

export function mockZodResolver<Input extends FieldValues, Context, Output>(
  schema: z.ZodSchema<Output, any, Input>,
  schemaOptions?: Partial<z.ParseParams>,
  resolverOptions?: {
    mode?: 'async' | 'sync';
    raw?: false;
  },
): Resolver<Input, Context, Output>;
// passing `resolverOptions.raw: true` you get back the input type
export function mockZodResolver<Input extends FieldValues, Context, Output>(
  schema: z.ZodSchema<Output, any, Input>,
  schemaOptions: Partial<z.ParseParams> | undefined,
  resolverOptions: {
    mode?: 'async' | 'sync';
    raw: true;
  },
): Resolver<Input, Context, Input>;

export function mockZodResolver<
  Input extends FieldValues,
  Context,
  Output,
>(): Resolver<Input, Context, Output | Input> {
  return {} as any;
}
