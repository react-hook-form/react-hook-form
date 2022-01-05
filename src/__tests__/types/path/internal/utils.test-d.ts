import { expectType } from 'tsd';

import {
  AccessPattern,
  ArrayKey,
  AsKey,
  IsTuple,
  ToKey,
  UnionToIntersection,
} from '../../../../types/path/internal';
import { _ } from '../../__fixtures__';

/** {@link AsKey} */ {
  /** it should behave like a noop type when a Key is passed */ {
    const actual = _ as AsKey<'foo'>;
    expectType<'foo'>(actual);
  }

  /** it should evaluate to never if not a Key is passed */ {
    const actual = _ as AsKey<boolean>;
    expectType<never>(actual);
  }
}

/** {@link ToKey} */ {
  /** it should behave like a noop type when a Key is passed */ {
    const actual = _ as ToKey<'foo'>;
    expectType<'foo'>(actual);
  }

  /** it should evaluate to never if not a Key or ArrayKey is passed */ {
    const actual = _ as ToKey<boolean>;
    expectType<never>(actual);
  }

  /** it should convert an ArrayKey to a template literal type */ {
    const actual = _ as ToKey<ArrayKey>;
    expectType<`${ArrayKey}`>(actual);
  }
}

/** {@link IsTuple} */ {
  /** it should evaluate to true if it's a tuple */ {
    const actual = _ as IsTuple<[string, number]>;
    expectType<true>(actual);
  }

  /** it should evaluate to false if it's not a tuple */ {
    const actual = _ as IsTuple<string[]>;
    expectType<false>(actual);
  }
}

/** {@link UnionToIntersection} */ {
  /** it should intersect a union of objects */ {
    const actual = _ as UnionToIntersection<{ foo: string } | { bar: number }>;
    expectType<{ foo: string } & { bar: number }>(actual);
  }

  /** it should intersect wrapped unions */ {
    const actual = _ as UnionToIntersection<[0 | 1] | [1 | 2]>[never];
    expectType<1>(actual);
  }
}

/** {@link AccessPattern} */ {
  type Extends<A, B> = A extends B ? true : false;

  /** it should extend if it's a subtype */ {
    const actual = _ as Extends<
      AccessPattern<'abcd', 'abcd'>,
      AccessPattern<string, 'abcd'>
    >;
    expectType<true>(actual);
  }

  /** it should extend if it's a supertype */ {
    const actual = _ as Extends<
      AccessPattern<'abcd', string>,
      AccessPattern<'abcd', 'abcd'>
    >;
    expectType<true>(actual);
  }

  /** it shouldn't extend if it isn't a subtype */ {
    const actual = _ as Extends<
      AccessPattern<string, 'abcd'>,
      AccessPattern<'abcd', 'abcd'>
    >;
    expectType<false>(actual);
  }

  /** it shouldn't extend if it isn't a supertype */ {
    const actual = _ as Extends<
      AccessPattern<'abcd', 'abcd'>,
      AccessPattern<'abcd', string>
    >;
    expectType<false>(actual);
  }
}
