import { NullableArrayProperties } from './form';

describe('types/form', () => {
  it('NullableArrayProperties', () => {
    type T = NullableArrayProperties<{
      foo: string;
      bar?: Array<number>;
      baz: Array<string>;
      hoge: Array<{ nested: Array<string> }>;
    }>;
    const test: T[] = [];

    test.push({ foo: '', bar: [1], baz: [''], hoge: [{ nested: [''] }] });
    test.push({ foo: '' });

    // @ts-expect-error
    test.push({ foo: 1, bar: [1], baz: [''] });
    // @ts-expect-error
    test.push({ foo: '', bar: [''], baz: [''] });
    // @ts-expect-error
    test.push({ foo: '', bar: [1], baz: [1] });
    // @ts-expect-error
    test.push({ foo: '', bar: [1], baz: [''], hoge: [{}] });

    type T2 = NullableArrayProperties<{
      [key: string]: any;
      foo: string;
      bar?: Array<number>;
      baz: Array<string>;
    }>;
    const test2: T2[] = [];

    test2.push({ foo: '', bar: [1], baz: [''], somethingKey1: 1 });
    test2.push({ foo: '', somethingKey1: 1 });

    // @ts-expect-error
    test2.push({ foo: 1, bar: [1], baz: [''], somethingKey1: 1 });
    // @ts-expect-error
    test2.push({ foo: '', bar: [''], baz: [''], somethingKey1: 1 });
    // @ts-expect-error
    test2.push({ foo: '', bar: [1], baz: [1], somethingKey1: 1 });
  });
});
