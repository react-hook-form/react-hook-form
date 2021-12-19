import {
  ArrayKey,
  AsKey,
  AsKeyList,
  EvaluateKeyList,
  IsTuple,
  JoinKeyList,
  SplitPathString,
  ToKey,
  TupleKey,
} from '../../../types/path/internal';
import {
  expectTypesEqual,
  HundredPathString,
  HundredTuple,
  InfiniteType,
} from '../__fixtures__';

test("IsTuple should evaluate to true if it's a tuple", () => {
  type Actual = IsTuple<[string, number]>;
  type Expected = true;
  expectTypesEqual<Expected, Actual>(true);
});

test("IsTuple should evaluate to false if it's not a tuple", () => {
  type Actual = IsTuple<string[]>;
  type Expected = false;
  expectTypesEqual<Expected, Actual>(true);
});

test('TupleKey should evaluate to the own keys of the tuple', () => {
  type Actual = TupleKey<[string, number]>;
  type Expected = '0' | '1';
  expectTypesEqual<Expected, Actual>(true);
});

test('TupleKey should evaluate to never if an array type is passed', () => {
  type Actual = TupleKey<string[]>;
  type Expected = never;
  expectTypesEqual<Expected, Actual>(true);
});

test('AsKey should behave like a noop type when a Key is passed', () => {
  type Actual = AsKey<'foo'>;
  type Expected = 'foo';
  expectTypesEqual<Expected, Actual>(true);
});

test('AsKey should evaluate to never if not a Key is passed', () => {
  type Actual = AsKey<boolean>;
  type Expected = never;
  expectTypesEqual<Expected, Actual>(true);
});

test('ToKey should behave like a noop type when a Key is passed', () => {
  type Actual = ToKey<'foo'>;
  type Expected = 'foo';
  expectTypesEqual<Expected, Actual>(true);
});

test('ToKey should evaluate to never if not a Key or ArrayKey is passed', () => {
  type Actual = ToKey<boolean>;
  type Expected = never;
  expectTypesEqual<Expected, Actual>(true);
});

test('ToKey should convert an ArrayKey to a template literal type', () => {
  type Actual = ToKey<ArrayKey>;
  type Expected = `${ArrayKey}`;
  expectTypesEqual<Expected, Actual>(true);
});

test('AsKeyList should behave like a noop type when a KeyList is passed', () => {
  type Actual = AsKeyList<['foo']>;
  type Expected = ['foo'];
  expectTypesEqual<Expected, Actual>(true);
});

test('AsKeyList should evaluate to never if not a KeyList is passed', () => {
  type Actual = AsKeyList<[42]>;
  type Expected = never;
  expectTypesEqual<Expected, Actual>(true);
});

test('SplitPathString should split the PathString', () => {
  type Actual = SplitPathString<'foo.bar.0.baz'>;
  type Expected = ['foo', 'bar', '0', 'baz'];
  expectTypesEqual<Expected, Actual>(true);
});

test('SplitPathString should split a PathString which does not contain a "."', () => {
  type Actual = SplitPathString<'foo'>;
  type Expected = ['foo'];
  expectTypesEqual<Expected, Actual>(true);
});

test('SplitPathString should split a PathString containing only a "."', () => {
  type Actual = SplitPathString<'.'>;
  type Expected = ['', ''];
  expectTypesEqual<Expected, Actual>(true);
});

test('SplitPathString should be implemented tail recursively', () => {
  type Actual = SplitPathString<HundredPathString<'foo'>>;
  type Expected = HundredTuple<'foo'>;
  expectTypesEqual<Expected, Actual>(true);
});

test('JoinKeyList should join the KeyList', () => {
  type Actual = JoinKeyList<['foo', 'bar', '0', 'baz']>;
  type Expected = 'foo.bar.0.baz';
  expectTypesEqual<Expected, Actual>(true);
});

test('JoinKeyList should join a KeyList of length 1', () => {
  type Actual = JoinKeyList<['foo']>;
  type Expected = 'foo';
  expectTypesEqual<Expected, Actual>(true);
});

test('JoinKeyList should evaluate to never when passed an empty KeyList', () => {
  type Actual = JoinKeyList<[]>;
  type Expected = never;
  expectTypesEqual<Expected, Actual>(true);
});

test('JoinKeyList should be implemented tail recursively', () => {
  type Actual = JoinKeyList<HundredTuple<'foo'>>;
  type Expected = HundredPathString<'foo'>;
  expectTypesEqual<Expected, Actual>(true);
});

test('EvaluateKeyList should traverse an object', () => {
  type Actual = EvaluateKeyList<InfiniteType<number>, ['foo', 'foo', 'value']>;
  type Expected = number;
  expectTypesEqual<Expected, Actual>(true);
});

test('EvaluateKeyList should traverse a tuple', () => {
  type Actual = EvaluateKeyList<InfiniteType<boolean>, ['bar', '0', 'value']>;
  type Expected = boolean;
  expectTypesEqual<Expected, Actual>(true);
});

test('EvaluateKeyList should evaluate to never if the path is not valid', () => {
  type Actual = EvaluateKeyList<InfiniteType<string>, ['foobar']>;
  type Expected = never;
  expectTypesEqual<Expected, Actual>(true);
});

test('EvaluateKeyList should be implemented tail recursively', () => {
  type Actual = EvaluateKeyList<InfiniteType<string>, HundredTuple<'foo'>>;
  type Expected = InfiniteType<string>;
  expectTypesEqual<Expected, Actual>(true);
});
