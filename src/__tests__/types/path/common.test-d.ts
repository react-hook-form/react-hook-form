import { expectType } from 'tsd';

import {
  ArrayKey,
  AsKey,
  AsKeyList,
  EvaluateKey,
  EvaluateKeyList,
  IsTuple,
  JoinKeyList,
  SplitPathString,
  ToKey,
  TupleKey,
} from '../../../types/path/common';
import {
  _,
  HundredPathString,
  HundredTuple,
  InfiniteType,
} from '../__fixtures__';

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

/** {@link TupleKey} */ {
  /** it should evaluate to the own keys of the tuple */ {
    const actual = _ as TupleKey<[string, number]>;
    expectType<'0' | '1'>(actual);
  }

  /** it should evaluate to never if an array type is passed */ {
    const actual = _ as TupleKey<string[]>;
    expectType<never>(actual);
  }
}

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

/** {@link AsKeyList} */ {
  /** it should behave like a noop type when a KeyList is passed */ {
    const actual = _ as AsKeyList<['foo']>;
    expectType<['foo']>(actual);
  }

  /** it should evaluate to never if not a KeyList is passed */ {
    const actual = _ as AsKeyList<[42]>;
    expectType<never>(actual);
  }
}

/** {@link SplitPathString} */ {
  /** it should split the PathString */ {
    const actual = _ as SplitPathString<'foo.bar.0.baz'>;
    expectType<['foo', 'bar', '0', 'baz']>(actual);
  }

  /** it should split a PathString which does not contain a "." */ {
    const actual = _ as SplitPathString<'foo'>;
    expectType<['foo']>(actual);
  }

  /** it should split a PathString containing only a "." */ {
    const actual = _ as SplitPathString<'.'>;
    expectType<['', '']>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as SplitPathString<HundredPathString<'foo'>>;
    expectType<HundredTuple<'foo'>>(actual);
  }
}

/** {@link JoinKeyList} */ {
  /** it should join the KeyList */ {
    const actual = _ as JoinKeyList<['foo', 'bar', '0', 'baz']>;
    expectType<'foo.bar.0.baz'>(actual);
  }

  /** it should join a KeyList of length 1 */ {
    const actual = _ as JoinKeyList<['foo']>;
    expectType<'foo'>(actual);
  }

  /** it should evaluate to never when passed an empty KeyList */ {
    const actual = _ as JoinKeyList<[]>;
    expectType<never>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as JoinKeyList<HundredTuple<'foo'>>;
    expectType<HundredPathString<'foo'>>(actual);
  }
}

/** {@link EvaluateKey} */ {
  /** it should traverse an object */ {
    const actual = _ as EvaluateKey<{ foo: number; bar: string }, 'foo'>;
    expectType<number>(actual);
  }

  /** it should traverse a tuple */ {
    const actual = _ as EvaluateKey<[boolean, string], '1'>;
    expectType<string>(actual);
  }

  /** it should traverse an array */ {
    const actual = _ as EvaluateKey<boolean[], '42'>;
    expectType<boolean>(actual);
  }

  /** it should evaluate to never if the key is not valid */ {
    const actual = _ as EvaluateKey<{ foo: string }, 'foobar'>;
    expectType<never>(actual);
  }
}

/** {@link EvaluateKeyList} */ {
  /** it should traverse an object */ {
    const actual = _ as EvaluateKeyList<
      InfiniteType<number>,
      ['foo', 'foo', 'value']
    >;
    expectType<number>(actual);
  }

  /** it should traverse a tuple */ {
    const actual = _ as EvaluateKeyList<
      InfiniteType<boolean>,
      ['bar', '0', 'value']
    >;
    expectType<boolean>(actual);
  }

  /** it should traverse an array */ {
    const actual = _ as EvaluateKeyList<
      InfiniteType<boolean>,
      ['baz', '42', 'value']
    >;
    expectType<boolean>(actual);
  }

  /** it should evaluate to never if the path is not valid */ {
    const actual = _ as EvaluateKeyList<InfiniteType<string>, ['foobar']>;
    expectType<never>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as EvaluateKeyList<
      InfiniteType<string>,
      HundredTuple<'foo'>
    >;
    expectType<InfiniteType<string>>(actual);
  }
}
