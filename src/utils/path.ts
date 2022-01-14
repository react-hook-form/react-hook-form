import {
  Auto,
  Branded,
  FieldValues,
  IsNever,
  IsUnknown,
  PathString,
} from '../types';
import { FieldPathSetValue, FieldPathValue } from '../types/path/value';

export function createPath<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
  TValue,
  TValueSet,
>(
  path: Auto.TypedFieldPath<TFieldValues, TPathString, TValue, TValueSet>,
): Branded.TypedFieldPath<
  TFieldValues,
  IsUnknown<TValue> extends true
    ? FieldPathValue<TFieldValues, TPathString>
    : TValue,
  IsNever<TValueSet> extends true
    ? FieldPathSetValue<TFieldValues, TPathString>
    : TValueSet
> {
  return path as never;
}

export function joinPath<
  TFieldValues extends FieldValues,
  TPathString extends PathString,
  TChildFieldValues extends FieldValues,
  TChildPathString extends PathString,
  TValue,
  TValueSet,
>(
  path: Auto.TypedFieldPath<
    TFieldValues,
    TPathString,
    TChildFieldValues,
    never
  >,
  childPath: Auto.TypedFieldPath<
    TChildFieldValues,
    TChildPathString,
    TValue,
    TValueSet
  >,
): Branded.TypedFieldPath<
  TFieldValues,
  IsUnknown<TValue> extends true
    ? FieldPathValue<TChildFieldValues, TChildPathString>
    : TValue,
  IsNever<TValueSet> extends true
    ? FieldPathSetValue<TChildFieldValues, TChildPathString>
    : TValueSet
> {
  return `${path}.${childPath}` as never;
}
