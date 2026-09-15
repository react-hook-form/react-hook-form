import type {
  ArrayPath,
  DeepMap,
  DeepPartial,
  DeepPartialSkipArrayKey,
  DeepRequired,
  FieldError,
  FieldErrors,
  FieldName,
  GlobalError,
  IsFlatObject,
  Merge,
  Path,
} from '../types';

import type { Equal, Expect } from './__fixtures__';
import { _ } from './__fixtures__';

declare const opaqueBrand: unique symbol;

/**
 * Stand-in for a rich third-party value type (Dayjs, Decimal, ...) whose
 * members should never be addressed by a form path. The brand keeps the
 * registration below from matching any other type in the typetests, since
 * the interface merging applies program-wide.
 */
interface OpaqueValue {
  [opaqueBrand]: true;
  unit: string;
  nested: { value: number };
  entries: { id: string }[];
}

declare module '../types/utils' {
  interface OpaqueTypes {
    opaqueValue: OpaqueValue;
  }
}

/** {@link OpaqueTypes} */ {
  /** it should treat registered opaque types as leaves in Path */ {
    const actual = _ as Path<{ foo: OpaqueValue; bar: { baz: string } }>;
    type _t = Expect<Equal<typeof actual, 'foo' | 'bar' | 'bar.baz'>>;
  }

  /** it should treat registered opaque types as leaves in ArrayPath */ {
    const actual = _ as ArrayPath<{
      foo: OpaqueValue;
      bar: { baz: number }[];
    }>;
    type _t = Expect<Equal<typeof actual, 'bar'>>;
  }

  /** it should not produce an array path for arrays of registered opaque types */ {
    const actual = _ as ArrayPath<{
      foo: OpaqueValue[];
      bar: { baz: number }[];
    }>;
    type _t = Expect<Equal<typeof actual, 'bar'>>;
  }

  /** it should keep an object flat for IsFlatObject when it only contains registered opaque leaves */ {
    const actual = _ as IsFlatObject<{ foo: OpaqueValue; bar: string }>;
    type _t = Expect<Equal<typeof actual, true>>;
  }

  /** it should preserve literal FieldName keys for forms with registered opaque fields */ {
    const actual = _ as FieldName<{ foo: OpaqueValue; bar: string }>;
    type _t = Expect<Equal<typeof actual, 'foo' | 'bar'>>;
  }

  /** it should map registered opaque types as a whole in DeepMap */ {
    const actual = _ as DeepMap<
      { foo: OpaqueValue; bar: { baz: string } },
      boolean
    >;
    type _t = Expect<
      Equal<typeof actual, { foo: boolean; bar: { baz: boolean } }>
    >;
  }

  /** it should not recurse into registered opaque types in DeepPartial */ {
    const actual = _ as DeepPartial<{
      foo: OpaqueValue;
      bar: { baz: string };
    }>;
    type _t = Expect<
      Equal<typeof actual, { foo?: OpaqueValue; bar?: { baz?: string } }>
    >;
  }

  /** it should not recurse into registered opaque types in DeepPartialSkipArrayKey */ {
    const actual = _ as DeepPartialSkipArrayKey<{
      foo: OpaqueValue[];
      bar: { baz: string };
    }>;
    type _t = Expect<
      Equal<typeof actual, { foo?: OpaqueValue[]; bar?: { baz?: string } }>
    >;
  }

  /** it should keep registered opaque types intact in DeepRequired */ {
    const actual = _ as DeepRequired<{
      foo?: OpaqueValue;
      bar?: { baz?: string };
    }>;
    type _t = Expect<
      Equal<typeof actual, { foo: OpaqueValue; bar: { baz: string } }>
    >;
  }

  /** it should produce a single FieldError for registered opaque types */ {
    const actual = _ as FieldErrors<{
      foo: OpaqueValue;
      bar: { baz: string };
    }>;
    type _t = Expect<
      Equal<
        typeof actual,
        {
          foo?: FieldError;
          bar?: Merge<FieldError, { baz?: FieldError }>;
        } & {
          root?: Record<string, GlobalError> & GlobalError;
          form?: GlobalError;
        }
      >
    >;
  }
}
