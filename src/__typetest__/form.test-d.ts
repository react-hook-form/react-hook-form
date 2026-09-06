import { z } from 'zod';

import type {
  FieldError,
  FieldErrors,
  FieldPath,
  FieldValues,
  Resolver,
  UseFormGetFieldState,
} from '../types';
import { useForm } from '../useForm';

import type { Equal, Expect } from './__fixtures__';

/** {@link UseFormHandleSubmit} */ {
  /** it should infer the correct defaultValues from useForm */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { handleSubmit } = useForm({
      defaultValues: {
        test: '',
        test1: 2,
      },
    });

    handleSubmit((data) => {
      type _t = Expect<Equal<typeof data, { test: string; test1: number }>>;
    });
  }

  /** it should infer the correct defaultValues from useForm generic */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { handleSubmit } = useForm<{
      test: string;
      test1: number;
    }>();

    handleSubmit((data) => {
      type _t = Expect<Equal<typeof data, { test: string; test1: number }>>;
    });
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
    type _t = Expect<
      Equal<
        typeof data,
        {
          test: string;
          test1: number;
        }
      >
    >;
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

  const watchedId = form.watch('id');
  type _t1 = Expect<Equal<typeof watchedId, number>>;

  form.handleSubmit((data) => {
    type _t = Expect<Equal<typeof data, { id: number }>>;
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
    type _t = Expect<Equal<typeof data, { id: string }>>;
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
    type _t1 = Expect<Equal<typeof data, { test: string }>>;
    // @ts-expect-error `data` should be union and thus should not be assignable to `{ test1: number }`
    type _t2 = Expect<Equal<typeof data, { test1: number }>>;
    type _t3 = Expect<Equal<typeof data, { test: string } | { test1: number }>>;
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

    const state = getFieldState('test');
    type _t = Expect<
      Equal<
        typeof state,
        {
          invalid: boolean;
          isDirty: boolean;
          isTouched: boolean;
          isValidating: boolean;
          error?: FieldError;
        }
      >
    >;
  }

  /** it should return associated field state when formState is supplied */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { getFieldState, formState } = useForm({
      defaultValues: {
        test: '',
      },
    });

    const state = getFieldState('test', formState);
    type _t = Expect<
      Equal<
        typeof state,
        {
          invalid: boolean;
          isDirty: boolean;
          isTouched: boolean;
          isValidating: boolean;
          error?: FieldError;
        }
      >
    >;
  }

  /** it should resolve leaf and parent error nodes from their field paths */ {
    type FormValues = {
      leaf: string;
      user: {
        name: string;
      };
      files: File[];
    };

    /* eslint-disable react-hooks/rules-of-hooks */
    const { getFieldState } = useForm<FormValues>();

    const leaf = getFieldState('leaf').error;
    const user = getFieldState('user').error;
    const files = getFieldState('files').error;
    const userMessage = getFieldState('user').error?.message;
    const userType = getFieldState('user').error?.type;

    type Errors = FieldErrors<FormValues>;
    type _t1 = Expect<Equal<typeof leaf, FieldError | undefined>>;
    type _t2 = Expect<
      Equal<typeof user, NonNullable<Errors['user']> | undefined>
    >;
    type _t3 = Expect<
      Equal<typeof files, NonNullable<Errors['files']> | undefined>
    >;
    type _t4 = Expect<
      Equal<NonNullable<typeof files>[number], FieldError | undefined>
    >;
    type _t5 = Expect<Equal<typeof userMessage, string | undefined>>;
    type _t6 = Expect<Equal<typeof userType, FieldError['type'] | undefined>>;
  }

  /** it should preserve flat errors for generic forms */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const anyError = useForm<any>().getFieldState('anything').error;
    const fieldValuesError =
      useForm<FieldValues>().getFieldState('anything').error;
    const form = useForm<{ profile: { name: string } }>();

    const getGenericMessage = <
      TFieldValues extends FieldValues,
      TName extends FieldPath<TFieldValues>,
    >(
      getFieldState: UseFormGetFieldState<TFieldValues>,
      name: TName,
    ) => {
      const error: FieldError | undefined = getFieldState(name).error;
      const message: string | undefined = error?.message;

      return message;
    };

    const genericMessage = getGenericMessage(form.getFieldState, 'profile');

    type _t1 = Expect<Equal<typeof anyError, FieldError | undefined>>;
    type _t2 = Expect<Equal<typeof fieldValuesError, FieldError | undefined>>;
    type _t3 = Expect<
      Equal<NonNullable<typeof anyError>['message'], string | undefined>
    >;
    type _t4 = Expect<
      Equal<NonNullable<typeof fieldValuesError>['message'], string | undefined>
    >;
    type _t5 = Expect<Equal<typeof genericMessage, string | undefined>>;
  }

  /** it should resolve deep array paths without widening to unknown */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { getFieldState } = useForm<{
      users: Array<{ firstName: string }>;
    }>();

    const error = getFieldState('users.0.firstName').error;
    type _t = Expect<Equal<typeof error, FieldError | undefined>>;
  }
}

/** {@link UseFormSubscribe} */ {
  /** it should allow subscribing to submit state fields */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { subscribe } = useForm<{
      test: string;
    }>();

    subscribe({
      formState: {
        isSubmitted: true,
        submitCount: true,
      },
      callback: (state) => {
        type _t1 = Expect<Equal<typeof state.isSubmitted, boolean | undefined>>;
        type _t2 = Expect<Equal<typeof state.submitCount, number | undefined>>;
      },
    });
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
