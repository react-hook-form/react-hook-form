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
  HundredPathString,
  HundredTuple,
  InfiniteType,
  type,
} from '../__fixtures__';

/** {@link IsTuple} */ {
  /** it should evaluate to true if it's a tuple */ {
    type Actual = IsTuple<[string, number]>;
    expectType<true>(type<Actual>());
  }

  /** it should evaluate to false if it's not a tuple */ {
    type Actual = IsTuple<string[]>;
    expectType<false>(type<Actual>());
  }
}

/** {@link TupleKey} */ {
  /** it should evaluate to the own keys of the tuple */ {
    type Actual = TupleKey<[string, number]>;
    expectType<'0' | '1'>(type<Actual>());
  }

  /** it should evaluate to never if an array type is passed */ {
    type Actual = TupleKey<string[]>;
    expectType<never>(type<Actual>());
  }
}

/** {@link AsKey} */ {
  /** it should behave like a noop type when a Key is passed */ {
    type Actual = AsKey<'foo'>;
    expectType<'foo'>(type<Actual>());
  }

  /** it should evaluate to never if not a Key is passed */ {
    type Actual = AsKey<boolean>;
    expectType<never>(type<Actual>());
  }
}

/** {@link ToKey} */ {
  /** it should behave like a noop type when a Key is passed */ {
    type Actual = ToKey<'foo'>;
    expectType<'foo'>(type<Actual>());
  }

  /** it should evaluate to never if not a Key or ArrayKey is passed */ {
    type Actual = ToKey<boolean>;
    expectType<never>(type<Actual>());
  }

  /** it should convert an ArrayKey to a template literal type */ {
    type Actual = ToKey<ArrayKey>;
    expectType<`${ArrayKey}`>(type<Actual>());
  }
}

/** {@link AsKeyList} */ {
  /** it should behave like a noop type when a KeyList is passed */ {
    type Actual = AsKeyList<['foo']>;
    expectType<['foo']>(type<Actual>());
  }

  /** it should evaluate to never if not a KeyList is passed */ {
    type Actual = AsKeyList<[42]>;
    expectType<never>(type<Actual>());
  }
}

/** {@link SplitPathString} */ {
  /** it should split the PathString */ {
    type Actual = SplitPathString<'foo.bar.0.baz'>;
    expectType<['foo', 'bar', '0', 'baz']>(type<Actual>());
  }

  /** it should split a PathString which does not contain a "." */ {
    type Actual = SplitPathString<'foo'>;
    expectType<['foo']>(type<Actual>());
  }

  /** it should split a PathString containing only a "." */ {
    type Actual = SplitPathString<'.'>;
    expectType<['', '']>(type<Actual>());
  }

  /** it should be implemented tail recursively */ {
    type Actual = SplitPathString<HundredPathString<'foo'>>;
    expectType<HundredTuple<'foo'>>(type<Actual>());
  }
}

/** {@link JoinKeyList} */ {
  /** it should join the KeyList */ {
    type Actual = JoinKeyList<['foo', 'bar', '0', 'baz']>;
    expectType<'foo.bar.0.baz'>(type<Actual>());
  }

  /** it should join a KeyList of length 1 */ {
    type Actual = JoinKeyList<['foo']>;
    expectType<'foo'>(type<Actual>());
  }

  /** it should evaluate to never when passed an empty KeyList */ {
    type Actual = JoinKeyList<[]>;
    expectType<never>(type<Actual>());
  }

  /** it should be implemented tail recursively */ {
    type Actual = JoinKeyList<HundredTuple<'foo'>>;
    expectType<HundredPathString<'foo'>>(type<Actual>());
  }
}

/** {@link EvaluateKey} */ {
  /** it should traverse an object */ {
    type Actual = EvaluateKey<{ foo: number; bar: string }, 'foo'>;
    expectType<number>(type<Actual>());
  }

  /** it should traverse a tuple */ {
    type Actual = EvaluateKey<[boolean, string], '1'>;
    expectType<string>(type<Actual>());
  }

  /** it should traverse an array */ {
    type Actual = EvaluateKey<boolean[], '42'>;
    expectType<boolean>(type<Actual>());
  }

  /** it should evaluate to never if the key is not valid */ {
    type Actual = EvaluateKey<{ foo: string }, 'foobar'>;
    expectType<never>(type<Actual>());
  }
}

/** {@link EvaluateKeyList} */ {
  /** it should traverse an object */ {
    type Actual = EvaluateKeyList<
      InfiniteType<number>,
      ['foo', 'foo', 'value']
    >;
    expectType<number>(type<Actual>());
  }

  /** it should traverse a tuple */ {
    type Actual = EvaluateKeyList<InfiniteType<boolean>, ['bar', '0', 'value']>;
    expectType<boolean>(type<Actual>());
  }

  /** it should traverse an array */ {
    type Actual = EvaluateKeyList<
      InfiniteType<boolean>,
      ['baz', '42', 'value']
    >;
    expectType<boolean>(type<Actual>());
  }

  /** it should evaluate to never if the path is not valid */ {
    type Actual = EvaluateKeyList<InfiniteType<string>, ['foobar']>;
    expectType<never>(type<Actual>());
  }

  /** it should be implemented tail recursively */ {
    type Actual = EvaluateKeyList<InfiniteType<string>, HundredTuple<'foo'>>;
    expectType<InfiniteType<string>>(type<Actual>());
  }
}
