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
  expectTypesEqual,
  HundredPathString,
  HundredTuple,
  InfiniteType,
} from '../__fixtures__';

describe('IsTuple', () => {
  it("should evaluate to true if it's a tuple", () => {
    type Actual = IsTuple<[string, number]>;
    type Expected = true;
    expectTypesEqual<Expected, Actual>(true);
  });

  it("should evaluate to false if it's not a tuple", () => {
    type Actual = IsTuple<string[]>;
    type Expected = false;
    expectTypesEqual<Expected, Actual>(true);
  });
});

describe('TupleKey', () => {
  it('should evaluate to the own keys of the tuple', () => {
    type Actual = TupleKey<[string, number]>;
    type Expected = '0' | '1';
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should evaluate to never if an array type is passed', () => {
    type Actual = TupleKey<string[]>;
    type Expected = never;
    expectTypesEqual<Expected, Actual>(true);
  });
});

describe('AsKey', () => {
  it('should behave like a noop type when a Key is passed', () => {
    type Actual = AsKey<'foo'>;
    type Expected = 'foo';
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should evaluate to never if not a Key is passed', () => {
    type Actual = AsKey<boolean>;
    type Expected = never;
    expectTypesEqual<Expected, Actual>(true);
  });
});

describe('ToKey', () => {
  it('should behave like a noop type when a Key is passed', () => {
    type Actual = ToKey<'foo'>;
    type Expected = 'foo';
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should evaluate to never if not a Key or ArrayKey is passed', () => {
    type Actual = ToKey<boolean>;
    type Expected = never;
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should convert an ArrayKey to a template literal type', () => {
    type Actual = ToKey<ArrayKey>;
    type Expected = `${ArrayKey}`;
    expectTypesEqual<Expected, Actual>(true);
  });
});

describe('AsKeyList', () => {
  it('should behave like a noop type when a KeyList is passed', () => {
    type Actual = AsKeyList<['foo']>;
    type Expected = ['foo'];
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should evaluate to never if not a KeyList is passed', () => {
    type Actual = AsKeyList<[42]>;
    type Expected = never;
    expectTypesEqual<Expected, Actual>(true);
  });
});

describe('SplitPathString', () => {
  it('should split the PathString', () => {
    type Actual = SplitPathString<'foo.bar.0.baz'>;
    type Expected = ['foo', 'bar', '0', 'baz'];
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should split a PathString which does not contain a "."', () => {
    type Actual = SplitPathString<'foo'>;
    type Expected = ['foo'];
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should split a PathString containing only a "."', () => {
    type Actual = SplitPathString<'.'>;
    type Expected = ['', ''];
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should be implemented tail recursively', () => {
    type Actual = SplitPathString<HundredPathString<'foo'>>;
    type Expected = HundredTuple<'foo'>;
    expectTypesEqual<Expected, Actual>(true);
  });
});

describe('JoinKeyList', () => {
  it('should join the KeyList', () => {
    type Actual = JoinKeyList<['foo', 'bar', '0', 'baz']>;
    type Expected = 'foo.bar.0.baz';
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should join a KeyList of length 1', () => {
    type Actual = JoinKeyList<['foo']>;
    type Expected = 'foo';
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should evaluate to never when passed an empty KeyList', () => {
    type Actual = JoinKeyList<[]>;
    type Expected = never;
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should be implemented tail recursively', () => {
    type Actual = JoinKeyList<HundredTuple<'foo'>>;
    type Expected = HundredPathString<'foo'>;
    expectTypesEqual<Expected, Actual>(true);
  });
});

describe('EvaluateKey', () => {
  it('should traverse an object', () => {
    type Actual = EvaluateKey<{ foo: number; bar: string }, 'foo'>;
    type Expected = number;
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should traverse a tuple', () => {
    type Actual = EvaluateKey<[boolean, string], '1'>;
    type Expected = string;
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should traverse an array', () => {
    type Actual = EvaluateKey<boolean[], '42'>;
    type Expected = boolean;
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should evaluate to never if the key is not valid', () => {
    type Actual = EvaluateKey<{ foo: string }, 'foobar'>;
    type Expected = never;
    expectTypesEqual<Expected, Actual>(true);
  });
});

describe('EvaluateKeyList', () => {
  it('should traverse an object', () => {
    type Actual = EvaluateKeyList<
      InfiniteType<number>,
      ['foo', 'foo', 'value']
    >;
    type Expected = number;
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should traverse a tuple', () => {
    type Actual = EvaluateKeyList<InfiniteType<boolean>, ['bar', '0', 'value']>;
    type Expected = boolean;
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should traverse an array', () => {
    type Actual = EvaluateKeyList<
      InfiniteType<boolean>,
      ['baz', '42', 'value']
    >;
    type Expected = boolean;
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should evaluate to never if the path is not valid', () => {
    type Actual = EvaluateKeyList<InfiniteType<string>, ['foobar']>;
    type Expected = never;
    expectTypesEqual<Expected, Actual>(true);
  });

  it('should be implemented tail recursively', () => {
    type Actual = EvaluateKeyList<InfiniteType<string>, HundredTuple<'foo'>>;
    type Expected = InfiniteType<string>;
    expectTypesEqual<Expected, Actual>(true);
  });
});
