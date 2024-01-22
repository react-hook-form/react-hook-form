import { expectType } from 'tsd';

import { FieldError } from '../types';
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
      error?: FieldError;
    }>(getFieldState('test', formState));
  }
}
