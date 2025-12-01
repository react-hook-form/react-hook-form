import { expectType } from 'tsd';

import { useForm } from '../useForm';
import { Watch } from '../watch';

/** {@link Watch} */ {
  /** it should have correct types for render function parameters */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { control } = useForm<{
      foo: string;
      bar: string;
      baz: {
        qux: string;
      };
      quux: number;
      fie: null;
      foe: { qux: number[] };
    }>();

    void Watch({
      control,
      names: ['foo', 'fie', 'quux', 'baz', 'baz.qux'],
      render: (values) => {
        expectType<readonly [string, null, number, { qux: string }, string]>(
          values,
        );
        return null;
      },
    });
  }
}
