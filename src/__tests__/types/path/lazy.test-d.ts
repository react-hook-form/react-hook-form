import { expectType } from 'tsd';

import {
  DropLastElement,
  Keys,
  SuggestChildPaths,
  SuggestParentPath,
  SuggestPath,
  ValidKeyListPrefix,
} from '../../../types/path/lazy';
import { _, HundredTuple, InfiniteType } from '../__fixtures__';

/** {@link Keys} */ {
  /** it should return the keys of an object */ {
    type Actual = Keys<{ foo: string; bar: number }>;
    expectType<'foo' | 'bar'>(_ as Actual);
  }

  /** it should return the keys of a tuple */ {
    type Actual = Keys<[number, string]>;
    expectType<'0' | '1'>(_ as Actual);
  }

  /** it should return the keys of an array */ {
    type Actual = Keys<string[]>;
    expectType<`${number}`>(_ as Actual);
  }

  /** it should only return the keys of string properties */ {
    type Actual = Keys<{ foo: string; bar: number }, string>;
    expectType<'foo'>(_ as Actual);
  }
}

/** {@link ValidKeyListPrefix} */ {
  /** it should return the entire path if it is valid */ {
    type Actual = ValidKeyListPrefix<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'baz', '42']
    >;
    expectType<['foo', 'bar', '0', 'baz', '42']>(_ as Actual);
  }

  /** it should return the longest valid prefix */ {
    type Actual = ValidKeyListPrefix<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'ba', '42']
    >;
    expectType<['foo', 'bar', '0']>(_ as Actual);
  }

  /** it should return an empty tuple when the path is an empty tuple */ {
    type Actual = ValidKeyListPrefix<InfiniteType<string>, []>;
    expectType<[]>(_ as Actual);
  }

  /** it should be implemented tail recursively */ {
    type Actual = ValidKeyListPrefix<InfiniteType<string>, HundredTuple<'foo'>>;
    expectType<HundredTuple<'foo'>>(_ as Actual);
  }
}

/** {@link DropLastElement} */ {
  /** it should remove the last element from a tuple */ {
    type Actual = DropLastElement<[0, 1, 2]>;
    expectType<[0, 1]>(_ as Actual);
  }

  /** it should return the empty tuple when passed the empty tuple */ {
    type Actual = DropLastElement<[]>;
    expectType<[]>(_ as Actual);
  }
}

/** {@link SuggestParentPath} */ {
  /** it should evaluate to the parent path */ {
    type Actual = SuggestParentPath<['foo', 'bar', 'baz']>;
    expectType<'foo.bar'>(_ as Actual);
  }

  /** it should evaluate to the never if there is no parent path */ {
    type Actual = SuggestParentPath<['foo']>;
    expectType<never>(_ as Actual);
  }
}

/** {@link SuggestChildPaths} */ {
  /** it should suggest paths when the current path is empty */ {
    type Actual = SuggestChildPaths<InfiniteType<string>, [], unknown>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(_ as Actual);
  }

  /** it should suggest paths when the current path is not empty */ {
    type Actual = SuggestChildPaths<
      InfiniteType<string>,
      ['foo', 'foo'],
      unknown
    >;
    expectType<'foo.foo.foo' | 'foo.foo.bar' | 'foo.foo.baz' | 'foo.foo.value'>(
      _ as Actual,
    );
  }

  /** it should suggest only matching or traversable paths */ {
    type Actual = SuggestChildPaths<InfiniteType<string>, ['foo'], number>;
    expectType<'foo.foo' | 'foo.bar' | 'foo.baz'>(_ as Actual);
  }

  /** it should suggest paths into a tuple */ {
    type Actual = SuggestChildPaths<InfiniteType<string>, ['bar'], unknown>;
    expectType<`bar.0`>(_ as Actual);
  }

  /** it should suggest paths into an array */ {
    type Actual = SuggestChildPaths<InfiniteType<string>, ['baz'], unknown>;
    expectType<`baz.${number}`>(_ as Actual);
  }

  /** it should evaluate to never if the path does not exist */ {
    type Actual = SuggestChildPaths<InfiniteType<string>, ['foobar'], unknown>;
    expectType<never>(_ as Actual);
  }
}

/** {@link SuggestPath} */ {
  /** it should suggest all top level paths when the path string is empty */ {
    type Actual = SuggestPath<InfiniteType<string>, '', unknown>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(_ as Actual);
  }

  /** it should not suggest the current path if it is invalid */ {
    type Actual = SuggestPath<InfiniteType<string>, 'foo.foobar', unknown>;
    expectType<'foo' | 'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value'>(
      _ as Actual,
    );
  }

  /** it should suggest the current path if it is valid */ {
    type Actual = SuggestPath<InfiniteType<string>, 'foo', unknown>;
    expectType<'foo' | 'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value'>(
      _ as Actual,
    );
  }

  /** it should suggest the current path and the parent path */ {
    type Actual = SuggestPath<InfiniteType<string>, 'foo.value', unknown>;
    expectType<'foo' | 'foo.value'>(_ as Actual);
  }

  /** it should not suggest the current path if it has the wrong value */ {
    type Actual = SuggestPath<InfiniteType<string>, 'foo.value', number>;
    expectType<'foo'>(_ as Actual);
  }

  /** it should not suggest paths which point to the wrong type */ {
    type Actual = SuggestPath<InfiniteType<string>, 'foo.foo', number>;
    expectType<'foo' | 'foo.foo.foo' | 'foo.foo.bar' | 'foo.foo.baz'>(
      _ as Actual,
    );
  }
}
