import { KnownKeyOf } from './utils';

describe('types/utils', () => {
  it('KnownKeyOf', () => {
    type T = KnownKeyOf<{ [key: string]: any; a: string; b: number }>;
    const test: T[] = [];

    test.push('a');
    test.push('b');
    // @ts-expect-error
    test.push('somethingKey');
  });
});
