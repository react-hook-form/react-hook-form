import { expectAssignable, expectNotAssignable, expectType } from 'tsd';

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
      names: ['foo', 'fie', 'quux', 'baz', 'baz.qux'],
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
      names: 'baz.qux',
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
      names: 'baz.qux',
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
      names: 'baz.qux',
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
      names: ['baz.qux', 'fie', 'quux'],
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

  /** It should not be valid node if form values are not a valid node. */ {
    const { control } = useForm<FormData>();

    const result = Watch({
      control,
    });

    expectNotAssignable<React.ReactNode>(result);
  }

  /** It should not be valid node if default value is not a valid node. */ {
    const { control } = useForm<FormData>();

    const result = Watch({
      control,
      defaultValue: {},
    });

    expectNotAssignable<React.ReactNode>(result);
  }

  /** It should be be valid node if named default value is a valid node. */ {
    const { control } = useForm<FormData>();

    const result = Watch({
      control,
      name: 'foo',
      defaultValue: '',
    });

    expectAssignable<React.ReactNode>(result);
  }

  /** It should be not be valid node if named default value is not a valid node. */ {
    const { control } = useForm<FormData>();

    const result = Watch({
      control,
      name: 'baz',
      defaultValue: { qux: '' },
    });

    expectNotAssignable<React.ReactNode>(result);
  }

  /** It should be not be valid node if computed value is not a valid node. */ {
    const { control } = useForm<FormData>();

    const result = Watch({
      control,
      compute: () => {
        return {};
      },
    });

    expectNotAssignable<React.ReactNode>(result);
  }

  /** It should be be valid node if computed value is a valid node. */ {
    const { control } = useForm<FormData>();

    const result = Watch({
      control,
      compute: () => {
        return '';
      },
    });

    expectAssignable<React.ReactNode>(result);
  }

  /** It should be not be valid node if rendered value is not a valid node. */ {
    const { control } = useForm<FormData>();

    const result = Watch({
      control,
      render: () => {
        return {};
      },
    });

    expectNotAssignable<React.ReactNode>(result);
  }

  /** It should be be valid node if rendered value is a valid node. */ {
    const { control } = useForm<FormData>();

    const result = Watch({
      control,
      render: () => {
        return '';
      },
    });

    expectAssignable<React.ReactNode>(result);
  }
}
