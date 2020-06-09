import { NullableArrayProperties } from './form';

describe('types/form', () => {
  it('NullableArrayProperties', () => {
    type T = NullableArrayProperties<{
      foo: string;
      hoge2?: string;
      bar?: Array<number>;
      baz: Array<string>;
      hoge: Array<{ nested: Array<string> }>;
      deep: {
        foo: {
          str: string;
          num?: number;
          array: string[];
        };
      };
    }>;
    const test: T[] = [];

    test.push({ foo: '', bar: [1], baz: [''], hoge: [{ nested: [''] }] });
    test.push({ foo: '' });
    test.push({ foo: '', hoge2: '' });
    test.push({ foo: '', deep: {} });
    test.push({ foo: '', deep: { foo: {} } });
    test.push({ foo: '', deep: { foo: { str: '' } } });
    test.push({ foo: '', deep: { foo: { num: 1 } } });
    test.push({ foo: '', deep: { foo: { array: [''] } } });

    // @ts-expect-error
    test.push({});
    // @ts-expect-error
    test.push({ foo: 1, bar: [1], baz: [''] });
    // @ts-expect-error
    test.push({ foo: '', bar: [''], baz: [''] });
    // @ts-expect-error
    test.push({ foo: '', bar: [1], baz: [1] });
    // @ts-expect-error
    test.push({ foo: '', bar: [1], baz: [''], hoge: [{}] });
    // @ts-expect-error
    test.push({ foo: '', hoge2: 1 });
    // @ts-expect-error
    test.push({ foo: '', deep: { foo: { str: 1 } } });
    // @ts-expect-error
    test.push({ foo: '', deep: { foo: { num: '' } } });
    // @ts-expect-error
    test.push({ foo: '', deep: { foo: { array: [0] } } });

    type T2 = NullableArrayProperties<{
      [key: string]: any;
      foo: string;
      hoge2?: string;
      bar?: Array<number>;
      baz: Array<string>;
      deep: {
        [key: string]: any;
        foo: {
          [key: string]: any;
          str: string;
          num?: number;
          array: string[];
        };
      };
    }>;
    const test2: T2[] = [];

    test2.push({ foo: '', bar: [1], baz: [''], somethingKey1: 1 });
    test2.push({ foo: '', somethingKey1: 1 });
    test2.push({
      foo: '',
      bar: [1],
      baz: [''],
      hoge: [{ nested: [''] }],
      deep: { foo: { str: '', somethingKeyOfFoo: 1 }, somethingKeyOfDeep: 1 },
      somethingKeyOfTopLevel: 1,
    });
    test2.push({ foo: '', deep: { foo: {} }, somethingKeyOfDeep: 1 });
    test2.push({
      foo: '',
      deep: { foo: { str: '', somethingKey: 1 }, somethingKeyOfFoo: 1 },
    });
    test2.push({
      foo: '',
      deep: { foo: { num: 1, somethingKey: 1 }, somethingKeyOfFoo: 1 },
    });
    test2.push({
      foo: '',
      deep: { foo: { array: [''], somethingKey: 1 }, somethingKeyOfFoo: 1 },
    });

    // @ts-expect-error
    test.push({});
    // @ts-expect-error
    test2.push({ foo: 1, bar: [1], baz: [''], somethingKey1: 1 });
    // @ts-expect-error
    test2.push({ foo: '', bar: [''], baz: [''], somethingKey1: 1 });
    // @ts-expect-error
    test2.push({ foo: '', bar: [1], baz: [1], somethingKey1: 1 });
    // @ts-expect-error
    test2.push({ foo: '', hoge2: 1 });
    // @ts-expect-error
    test2.push({ foo: '', deep: { foo: { str: 1 } } });
    // @ts-expect-error
    test2.push({ foo: '', deep: { foo: { num: '' } } });
    // @ts-expect-error
    test2.push({ foo: '', deep: { foo: { array: [0] } } });
  });
});
