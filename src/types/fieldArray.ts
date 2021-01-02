import { Control, UnpackNestedValue } from './form';
import { FieldValues } from './fields';
import { DeepPartial, Path, PathValue } from './utils';

export type FieldArrayName = string;

export type FieldArrayDefaultValues = Partial<Record<FieldArrayName, any>>;

export type UseFieldArrayProps<
  TFieldArrayValues extends FieldValues = FieldValues,
  TName extends Path<TFieldArrayValues> = Path<TFieldArrayValues>,
  TKeyName extends string = 'id'
> = {
  name: TName;
  keyName?: TKeyName;
  control?: Control<TFieldArrayValues>;
};

export type ResetFieldArrayFunctionRef<TFieldValues> = Record<
  FieldArrayName,
  (data?: UnpackNestedValue<DeepPartial<TFieldValues>>) => void
>;

type InferArrayType<T> = T extends (infer U)[] ? U : never;

export type ArrayField<
  TFieldArrayValues extends FieldValues = FieldValues,
  TName extends Path<TFieldArrayValues> = Path<TFieldArrayValues>,
  TKeyName extends string = 'id'
> = InferArrayType<PathValue<TFieldArrayValues, TName>> &
  Record<TKeyName, string>;

export type UseFieldArrayMethods<
  TFieldArrayValues extends FieldValues = FieldValues,
  TName extends Path<TFieldArrayValues> = Path<TFieldArrayValues>,
  TKeyName extends string = 'id'
> = {
  swap: (indexA: number, indexB: number) => void;
  move: (indexA: number, indexB: number) => void;
  prepend: (
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
    shouldFocus?: boolean,
  ) => void;
  append: (
    value:
      | ArrayField<TFieldArrayValues, TName, TKeyName>
      | ArrayField<TFieldArrayValues, TName, TKeyName>[],
    shouldFocus?: boolean,
  ) => void;
  remove: (index?: number | number[]) => void;
  insert: (
    index: number,
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
    shouldFocus?: boolean,
  ) => void;
  fields: ArrayField<TFieldArrayValues, TName, TKeyName>[];
};
