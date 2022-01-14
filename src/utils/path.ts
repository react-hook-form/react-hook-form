import { Auto, Branded, IsNever, IsUnknown, PathString } from '../types';
import { FieldPathSetValue, FieldPathValue } from '../types/path/value';

export function createPath<
  TFieldValues,
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
  TFieldValues,
  TPathString extends PathString,
  TChildFieldValues,
  TChildPathString extends PathString,
  TValue,
  TValueSet,
>(
  path: Auto.TypedFieldPath<
    TFieldValues,
    TPathString,
    TChildFieldValues,
    NonNullable<TChildFieldValues>
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
