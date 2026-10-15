import React from 'react';

import { Controller } from '../controller';
import type { FieldArray } from '../fieldArray';
import type {
  ControllerProps,
  FieldArrayPath,
  FieldArrayProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from '../types';
import { useForm } from '../useForm';

import type { Equal, Expect } from './__fixtures__';

type PreviousController = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(
  props: ControllerProps<TFieldValues, TName, TTransformedValues>,
) => React.ReactElement;

type PreviousFieldArray = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
>(
  props: FieldArrayProps<TFieldValues, TName, TKeyName>,
) => React.ReactElement;

/** {@link Controller} */ {
  /** it should keep the component props of Controller */ {
    type _t1 = Expect<
      Equal<
        React.ComponentProps<typeof Controller>,
        React.ComponentProps<PreviousController>
      >
    >;
    type _t2 = Expect<
      Equal<Parameters<typeof Controller>, Parameters<PreviousController>>
    >;
    type _t3 = Expect<
      Equal<ReturnType<typeof Controller>, ReturnType<PreviousController>>
    >;
  }

  /** it should work with higher-order components */ {
    const withLabel =
      <P extends object>(Component: React.ComponentType<P>) =>
      (props: P & { label: string }) =>
        React.createElement(Component, props);

    const LabelledController = withLabel(Controller);
    const MemoController = React.memo(Controller);

    LabelledController({
      label: 'label',
      name: 'test',
      render: ({ field }) => React.createElement('input', field),
    });

    React.createElement(MemoController, {
      name: 'test',
      render: ({ field }) => React.createElement('input', field),
    });
  }
}

/** {@link FieldArray} */ {
  /** it should keep the component props of FieldArray */ {
    type _t1 = Expect<
      Equal<
        React.ComponentProps<typeof FieldArray>,
        React.ComponentProps<PreviousFieldArray>
      >
    >;
    type _t2 = Expect<
      Equal<Parameters<typeof FieldArray>, Parameters<PreviousFieldArray>>
    >;
    type _t3 = Expect<
      Equal<ReturnType<typeof FieldArray>, ReturnType<PreviousFieldArray>>
    >;
  }
}

/** {@link UseFormReturn} */ {
  /** it should keep useForm assignable to UseFormReturn */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const form: UseFormReturn<{ test: string }> = useForm<{ test: string }>();
    const methods: UseFormReturn = useForm();

    type _t1 = Expect<
      Equal<keyof UseFormReturn<FieldValues>, keyof typeof methods>
    >;

    form.select('test');
  }

  /** it should allow mocks built from a partial UseFormReturn */ {
    const mock = {} as Partial<UseFormReturn<{ test: string }>>;
    const { select, ...rest }: Partial<UseFormReturn<{ test: string }>> = mock;

    rest.getValues;
    select;
  }
}
