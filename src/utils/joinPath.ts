import { Auto, Branded, IsNever, IsUnknown, PathString } from '../types';
import { FieldPathSetValue, FieldPathValue } from '../types/path/value';

export default function joinPath<
  TFieldValues,
  TPathString extends PathString,
  TChildFieldValues,
  TChildPathString extends PathString,
  TValue = unknown,
  TValueSet = never,
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
