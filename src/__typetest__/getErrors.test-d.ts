import type {
  FieldError,
  FieldErrors,
  FieldValues,
  GetErrorsResult,
  GlobalError,
} from '../types';
import { useForm } from '../useForm';

import type { Equal, Expect } from './__fixtures__';
import { _ } from './__fixtures__';

/** {@link UseFormGetErrors} */ {
  type FormValues = {
    email: string;
    name: string;
    user: { name: string };
    items: { name: string }[];
  };

  /* eslint-disable react-hooks/rules-of-hooks */
  const { getErrors, getFieldState } = useForm<FormValues>();

  /** it should return the full FieldErrors object without an argument */
  {
    const actual = getErrors();
    type _t = Expect<Equal<typeof actual, FieldErrors<FormValues>>>;
  }

  /** it should type `root` as an indexable record so `?.server` is accessible */
  {
    const actual = getErrors('root');
    type _t = Expect<
      Equal<
        typeof actual,
        (Record<string, GlobalError> & GlobalError) | undefined
      >
    >;
    // record access is allowed
    actual?.server;
  }

  /** it should type `root.${string}`, `form`, `form.${string}` as GlobalError */
  {
    const rootChild = getErrors('root.server');
    const form = getErrors('form');
    const formChild = getErrors('form.custom');
    type _t1 = Expect<Equal<typeof rootChild, GlobalError | undefined>>;
    type _t2 = Expect<Equal<typeof form, GlobalError | undefined>>;
    type _t3 = Expect<Equal<typeof formChild, GlobalError | undefined>>;
  }

  /** it should prioritize error namespaces over matching field paths */
  {
    type ShadowedFieldValues = {
      root: { server: string };
      form: { field: string };
    };

    /* eslint-disable react-hooks/rules-of-hooks */
    const getShadowedErrors = useForm<ShadowedFieldValues>().getErrors;
    const root = getShadowedErrors('root');
    const rootChild = getShadowedErrors('root.server');
    const form = getShadowedErrors('form');
    const formChild = getShadowedErrors('form.field');

    type _t1 = Expect<
      Equal<
        typeof root,
        (Record<string, GlobalError> & GlobalError) | undefined
      >
    >;
    type _t2 = Expect<Equal<typeof rootChild, GlobalError | undefined>>;
    type _t3 = Expect<Equal<typeof form, GlobalError | undefined>>;
    type _t4 = Expect<Equal<typeof formChild, GlobalError | undefined>>;
  }

  /** it should resolve precise leaf, parent, and array field error nodes */
  {
    const leaf = getErrors('email');
    const nestedLeaf = getErrors('user.name');
    const parent = getErrors('user');
    const arrayItemLeaf = getErrors('items.0.name');
    const arrayParent = getErrors('items');
    type _t1 = Expect<Equal<typeof leaf, FieldError | undefined>>;
    type _t2 = Expect<Equal<typeof nestedLeaf, FieldError | undefined>>;
    type _t3 = Expect<
      Equal<
        typeof parent,
        NonNullable<FieldErrors<FormValues>['user']> | undefined
      >
    >;
    type _t4 = Expect<Equal<typeof arrayItemLeaf, FieldError | undefined>>;
    type _t5 = Expect<
      Equal<
        typeof arrayParent,
        NonNullable<FieldErrors<FormValues>['items']> | undefined
      >
    >;
  }

  /** it should match the precise getFieldState error type */
  {
    const getErrorsResult = getErrors('items');
    const getFieldStateResult = getFieldState('items').error;
    type _t = Expect<Equal<typeof getErrorsResult, typeof getFieldStateResult>>;
  }

  /** it should distribute over a union input */
  {
    const actual = getErrors(_ as 'email' | 'root');
    type _t = Expect<
      Equal<
        typeof actual,
        FieldError | (Record<string, GlobalError> & GlobalError) | undefined
      >
    >;
  }

  /** it should distribute over field paths with different error shapes */
  {
    const actual = getErrors(_ as 'email' | 'items');
    type _t = Expect<
      Equal<
        typeof actual,
        FieldError | NonNullable<FieldErrors<FormValues>['items']> | undefined
      >
    >;
  }

  /** it should preserve tuple arity for an array of paths */
  {
    const names = ['email', 'items', 'root', 'form'] as const;
    const actual = getErrors(names);
    type _t = Expect<
      Equal<
        typeof actual,
        [
          FieldError | undefined,
          NonNullable<FieldErrors<FormValues>['items']> | undefined,
          (Record<string, GlobalError> & GlobalError) | undefined,
          GlobalError | undefined,
        ]
      >
    >;
  }

  /** it should preserve the flat error fallback for generic forms */
  {
    /* eslint-disable react-hooks/rules-of-hooks */
    const loose = useForm<any>().getErrors('anything');
    const fieldValues = useForm<FieldValues>().getErrors('anything');
    type _t1 = Expect<Equal<typeof loose, FieldError | undefined>>;
    type _t2 = Expect<Equal<typeof fieldValues, FieldError | undefined>>;
  }

  /** it should reject an unknown field path */
  {
    // @ts-expect-error unknown path is not assignable to FieldPath | ErrorNamespacePath
    getErrors('nonExistentField');
    // @ts-expect-error GetErrorsResult also constrains its path argument
    type _t = GetErrorsResult<FormValues, 'nonExistentField'>;
  }
}
