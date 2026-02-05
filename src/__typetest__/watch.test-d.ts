import { expectType } from 'tsd';

import { useForm } from '../useForm';
import { Watch } from '../watch';

type FormData = {
  foo: string;
  bar: string;
  baz: {
    qux: string;
  };
  quux: number;
  fie: null;
  foe: { qux: number[] };
};

/** {@link Watch} */ {
  /** it should have correct types for render function parameter when names is passed as array */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { control } = useForm<FormData>();

    void Watch({
      control,
      name: ['foo', 'fie', 'quux', 'baz', 'baz.qux'],
      render: (values) => {
        expectType<[string, null, number, { qux: string }, string]>(values);
        return null;
      },
    });
  }

  /** it should have correct types for render function parameter when names is passed as string */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { control } = useForm<FormData>();

    void Watch({
      control,
      name: 'baz.qux',
      render: (value) => {
        expectType<string>(value);
        return null;
      },
    });
  }

  /** it should have correct types for render function parameter when names omitted */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { control } = useForm<FormData>();

    void Watch({
      control,
      render: (value) => {
        expectType<FormData>(value);
        return null;
      },
    });
  }

  /** it should have correct types for render function parameter when compute is used */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { control } = useForm<FormData>();

    void Watch({
      control,
      name: 'baz.qux',
      compute: (val) => val.length > 2,
      render: (value) => {
        expectType<boolean>(value);
        return null;
      },
    });
  }

  /** it should have correct types for compute function parameter when names is passed as string */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { control } = useForm<FormData>();

    void Watch({
      control,
      name: 'baz.qux',
      compute: (val) => {
        expectType<string>(val);
        return val;
      },
      render: () => null,
    });
  }

  /** it should have correct types for compute function parameter when names is passed as array */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { control } = useForm<FormData>();

    void Watch({
      control,
      name: ['baz.qux', 'fie', 'quux'],
      compute: (val) => {
        expectType<[string, null, number]>(val);
        return val;
      },
      render: () => null,
    });
  }

  /** it should have correct types for compute function parameter when name is omitted */ {
    /* eslint-disable react-hooks/rules-of-hooks */
    const { control } = useForm<FormData>();

    void Watch({
      control,
      compute: (val) => {
        expectType<FormData>(val);
        return val;
      },
      render: () => null,
    });
  }
}
