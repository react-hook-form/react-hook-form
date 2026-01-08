// types/__tests__/formState.tsd.ts
import { expectType } from 'tsd';

import { FormStateSubscribe } from '../formStateSubscribe';
import type { FieldValues } from '../types';
import { type UseFormStateReturn } from '../types';
import { useForm } from '../useForm';

/** {@link FormState} */ {
  type FormType = {
    foo: string;
    bar: string;
    baz: { qux: string };
    quux: number;
    fie: null;
    foe: { qux: number[] };
  };

  /** it should type the render function parameter as UseFormStateReturn<TFieldValues> */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { control } = useForm<FormType>();

    void FormStateSubscribe({
      control,
      render: (state) => {
        // Whole object
        expectType<UseFormStateReturn<FormType>>(state);

        // Common scalars
        expectType<boolean>(state.isDirty);
        expectType<boolean>(state.isValid);
        expectType<boolean>(state.isValidating);
        expectType<number>(state.submitCount);
        expectType<boolean>(state.disabled);

        // Errors shape
        expectType<string | undefined>(state.errors.foo?.message);
        expectType<string | undefined>(state.errors.baz?.qux?.message);
        // unknown field is still safe (optional chain + message)
        expectType<string | undefined>(state.errors.foe?.qux?.[0]?.message);

        // Dirty fields map (nested booleans)
        expectType<boolean | undefined>(state.dirtyFields.foo);
        expectType<boolean | undefined>(state.dirtyFields.baz?.qux);

        // Touched fields map (nested booleans)
        expectType<boolean | undefined>(state.touchedFields.foo);
        expectType<boolean | undefined>(state.touchedFields.baz?.qux);

        // defaultValues is DeepPartial<FormType> | undefined in RHF
        expectType<string | undefined>(state.defaultValues?.foo);
        expectType<string | undefined>(state.defaultValues?.baz?.qux);

        return null;
      },
    });
  }

  /** it should accept a single subscribed name and keep the return type */ {
    const { control } = useForm<FormType>();

    void FormStateSubscribe({
      control,
      name: 'baz.qux',
      render: (state) => {
        expectType<UseFormStateReturn<FormType>>(state);
        expectType<string | undefined>(state.errors.baz?.qux?.message);
        expectType<boolean | undefined>(state.dirtyFields.baz?.qux);
        expectType<boolean | undefined>(state.touchedFields.baz?.qux);
        return null;
      },
    });
  }

  /** it should accept multiple subscribed names and keep the return type */ {
    const { control } = useForm<FormType>();

    void FormStateSubscribe({
      control,
      name: ['foo', 'bar', 'baz.qux'] as const,
      render: (state) => {
        expectType<UseFormStateReturn<FormType>>(state);
        expectType<string | undefined>(state.errors.foo?.message);
        expectType<string | undefined>(state.errors.bar?.message);
        expectType<string | undefined>(state.errors.baz?.qux?.message);
        return null;
      },
    });
  }

  /** it should allow using context (no control prop) and still infer types when provided upstream */ {
    // This block is purely type-level: we just assert render param type remains UseFormStateReturn<any>
    // when control isn't passed directly. Actual inference comes from provider at runtime.
    void FormStateSubscribe({
      // no control
      render: (state) => {
        // Without a generic argument here, state defaults to FieldValues
        expectType<UseFormStateReturn<FieldValues>>(state);
        return null;
      },
    });
  }
}
