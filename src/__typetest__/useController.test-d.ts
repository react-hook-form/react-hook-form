import { expectNotType, expectType } from 'tsd';

import { useController } from '../useController';

/** {@link useController} */ {
  /** it should NOT infer never[] when defaultValue is empty array without explicit types */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    const { field } = useController({
      name: 'items' as string,
      defaultValue: [],
    });

    expectNotType<never>(field.name);
    expectNotType<never[]>(field.value);

    if (Array.isArray(field.value)) {
      field.value.includes('test');
      field.value.push('test');
    }
  }

  /** it should work correctly with explicit type parameters */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    type FormValues = {
      items: string[];
    };

    const { field } = useController<FormValues, 'items'>({
      name: 'items',
      defaultValue: [],
    });

    expectType<string[]>(field.value);
    expectType<'items'>(field.name);
  }

  /** it should work with optional array fields */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    type FormValues = {
      optionalItems?: string[];
    };

    const { field } = useController<FormValues, 'optionalItems'>({
      name: 'optionalItems',
      defaultValue: undefined,
    });

    expectType<string[] | undefined>(field.value);
  }

  /** it should work with nested array access */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    type FormValues = {
      nested: {
        items: number[];
      };
    };

    const { field } = useController<FormValues, 'nested.items'>({
      name: 'nested.items',
      defaultValue: [],
    });

    expectType<number[]>(field.value);
  }

  /** it should handle array of objects */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    type FormValues = {
      users: Array<{ id: string; name: string }>;
    };

    const { field } = useController<FormValues, 'users'>({
      name: 'users',
      defaultValue: [],
    });

    expectType<Array<{ id: string; name: string }>>(field.value);
  }
}
