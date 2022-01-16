import { expectType } from 'tsd';

import { FieldError } from '../../types';
import { useForm } from '../../useForm';

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

/** {@link _UseFormGetFieldState} */ {
  /** it should return associated field state */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { _getFieldState } = useForm({
      defaultValues: {
        test: '',
      },
    });

    expectType<{
      invalid: boolean;
      isDirty: boolean;
      isTouched: boolean;
      error: FieldError;
    }>(_getFieldState('test'));
  }

  /** it should return associated field state when formState is supplied */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { _getFieldState, formState } = useForm({
      defaultValues: {
        test: '',
      },
    });

    expectType<{
      invalid: boolean;
      isDirty: boolean;
      isTouched: boolean;
      error: FieldError;
    }>(_getFieldState('test', formState));
  }
}
