import { Control, UnpackNestedValue } from './form';
import { FieldValues } from './fields';
import { DeepPartial, FieldPath, FieldPathValue } from './utils';

export type FieldArrayName = string;

export type FieldArrayDefaultValues = Partial<Record<FieldArrayName, any>>;

export type UseFieldArrayProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TKeyName extends string = 'id'
> = {
  name: TName;
  keyName?: TKeyName;
  control?: Control<TFieldValues>;
};

export type ResetFieldArrayFunctionRef<TFieldValues> = Record<
  FieldArrayName,
  (data?: UnpackNestedValue<DeepPartial<TFieldValues>>) => void
>;

type InferArrayType<T> = T extends (infer U)[] ? U : never;

export type ArrayFieldWithId<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TKeyName extends string = 'id'
> = InferArrayType<FieldPathValue<TFieldValues, TName>> &
  Record<TKeyName, string>;

export type ArrayField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = InferArrayType<FieldPathValue<TFieldValues, TName>>;

export type UseFieldArrayMethods<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TKeyName extends string = 'id'
> = {
  swap: (indexA: number, indexB: number) => void;
  move: (indexA: number, indexB: number) => void;
  prepend: (
    value:
      | Partial<ArrayField<TFieldValues, TName>>
      | Partial<ArrayField<TFieldValues, TName>>[],
    shouldFocus?: boolean,
  ) => void;
  append: (
    value:
      | Partial<ArrayField<TFieldValues, TName>>
      | Partial<ArrayField<TFieldValues, TName>>[],
    shouldFocus?: boolean,
  ) => void;
  remove: (index?: number | number[]) => void;
  insert: (
    index: number,
    value:
      | Partial<ArrayField<TFieldValues, TName>>
      | Partial<ArrayField<TFieldValues, TName>>[],
    shouldFocus?: boolean,
  ) => void;
  fields: ArrayFieldWithId<TFieldValues, TName, TKeyName>[];
};
