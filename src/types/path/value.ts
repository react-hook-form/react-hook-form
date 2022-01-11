import { FieldValues } from '../fields';

import { PathGetValue } from './internal/pathGetValue';
import { PathSetValue } from './internal/pathSetValue';
import { SplitPathString } from './internal/pathTuple';
import * as Branded from './branded';
import { PathString } from './pathString';

export type FieldPathValue<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
> = TPathString extends Branded.FieldPath<any>
  ? TPathString extends Branded.TypedFieldPath<TFieldValues, infer Value, never>
    ? Value
    : never
  : PathGetValue<TFieldValues, SplitPathString<TPathString>>;

export type FieldPathSetValue<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
> = TPathString extends Branded.FieldPath<any>
  ? TPathString extends Branded.TypedFieldPath<
      TFieldValues,
      unknown,
      infer Value
    >
    ? Value
    : never
  : PathSetValue<TFieldValues, SplitPathString<TPathString>>;
