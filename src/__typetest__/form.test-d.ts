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

/** {@link FieldNamesMarkedBoolean} */ {
  /** It should infer the correct types if there is an union type */ {
    type FormWithUnion = {
      always: string;
      nested: {
        foo: number;
        bar: {
          foo: boolean;
          bar: boolean;
        };
      };
      union:
        | {
            data: 'A';
            data1: string;
          }
        | {
            data: 'B';
            data2: string;
          };
    };
    /* eslint-disable react-hooks/rules-of-hooks */
    const {
      formState: { touchedFields },
    } = useForm<FormWithUnion>({
      defaultValues: {
        always: '',
        nested: {
          foo: 0,
          bar: {
            foo: true,
            bar: false,
          },
        },
        union: {
          data: 'A',
          data1: '',
        },
      },
    });

    expectType<{
      always?: boolean;
      nested?: {
        foo?: boolean;
        bar?: {
          foo?: boolean;
          bar?: boolean;
        };
      };
      union?: {
        data?: boolean;
        data1?: boolean;
        data2?: boolean;
      };
    }>(touchedFields);
    expectType<boolean | undefined>(touchedFields.always);
    expectType<boolean | undefined>(touchedFields.nested?.foo);
    expectType<boolean | undefined>(touchedFields.nested?.bar?.foo);
    expectType<boolean | undefined>(touchedFields.nested?.bar?.bar);
    expectType<boolean | undefined>(touchedFields.union?.data);
    expectType<boolean | undefined>(touchedFields.union?.data1);
    expectType<boolean | undefined>(touchedFields.union?.data2);
  }
}
