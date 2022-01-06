import { expectType } from 'tsd';

import {
  AsPathTuple,
  JoinPathTuple,
  SplitPathString,
} from '../../../../types/path/internal/pathTuple';
import { _, HundredPathString, HundredTuple } from '../../__fixtures__';

/** {@link AsPathTuple} */ {
  /** it should behave like a noop type when a PathTuple is passed */ {
    const actual = _ as AsPathTuple<['foo']>;
    expectType<['foo']>(actual);
  }

  /** it should evaluate to never if not a PathTuple is passed */ {
    const actual = _ as AsPathTuple<[42]>;
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

  /** it should return an empty tuple for a blank PathString */ {
    const actual = _ as SplitPathString<''>;
    expectType<[]>(actual);
  }

  /** it should return an empty tuple for a PathString containing only a "." */ {
    const actual = _ as SplitPathString<'.'>;
    expectType<[]>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as SplitPathString<HundredPathString<'foo'>>;
    expectType<HundredTuple<'foo'>>(actual);
  }

  /** it should work on unions */ {
    const actual = _ as SplitPathString<'foo.bar' | 'bar.foo'>;
    expectType<['foo', 'bar'] | ['bar', 'foo']>(actual);
  }

  /** it should split a PathString containing a number template */ {
    const actual = _ as SplitPathString<`foo.bar.${number}.baz`>;
    expectType<['foo', 'bar', `${number}`, 'baz']>(actual);
  }

  /** it should split a PathString containing a string template */ {
    const actual = _ as SplitPathString<`foo.bar.${string}.baz`>;
    expectType<['foo', 'bar', string, 'baz']>(actual);
  }
}

/** {@link JoinPathTuple} */ {
  /** it should join the PathTuple */ {
    const actual = _ as JoinPathTuple<['foo', 'bar', '0', 'baz']>;
    expectType<'foo.bar.0.baz'>(actual);
  }

  /** it should join a PathTuple of length 1 */ {
    const actual = _ as JoinPathTuple<['foo']>;
    expectType<'foo'>(actual);
  }

  /** it should evaluate to never when passed an empty PathTuple */ {
    const actual = _ as JoinPathTuple<[]>;
    expectType<never>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as JoinPathTuple<HundredTuple<'foo'>>;
    expectType<HundredPathString<'foo'>>(actual);
  }

  /** it should work on unions */ {
    const actual = _ as JoinPathTuple<['foo', 'bar'] | ['bar', 'foo']>;
    expectType<'foo.bar' | 'bar.foo'>(actual);
  }

  /** it should evaluate to never if a keys is never */ {
    const actual = _ as JoinPathTuple<['foo', never]>;
    expectType<never>(actual);
  }
}
