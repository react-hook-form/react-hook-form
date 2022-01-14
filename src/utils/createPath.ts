import { Auto, Branded, IsNever, IsUnknown, PathString } from '../types';
import { FieldPathSetValue, FieldPathValue } from '../types/path/value';

export default function createPath<
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
