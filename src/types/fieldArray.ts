import { Control } from './form';
import { FieldValues } from './fields';
import { FieldPath, FieldPathValue } from './utils';

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

type InferArrayType<T> = T extends (infer U)[] ? U : never;

export type FieldArrayWithId<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TKeyName extends string = 'id'
> = InferArrayType<FieldPathValue<TFieldValues, TName>> &
  Record<TKeyName, string>;

export type FieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = InferArrayType<FieldPathValue<TFieldValues, TName>>;

export type FieldArrayMethodProps = {
  shouldFocus?: boolean;
  focusIndex?: number;
  focusName?: string;
};

export type UseFieldArrayReturn<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TKeyName extends string = 'id'
> = {
  swap: (indexA: number, indexB: number) => void;
  move: (indexA: number, indexB: number) => void;
  prepend: (
    value:
      | Partial<FieldArray<TFieldValues, TName>>
      | Partial<FieldArray<TFieldValues, TName>>[],
    options?: FieldArrayMethodProps,
  ) => void;
  append: (
    value:
      | Partial<FieldArray<TFieldValues, TName>>
      | Partial<FieldArray<TFieldValues, TName>>[],
    options?: FieldArrayMethodProps,
  ) => void;
  remove: (index?: number | number[]) => void;
  insert: (
    index: number,
    value:
      | Partial<FieldArray<TFieldValues, TName>>
      | Partial<FieldArray<TFieldValues, TName>>[],
    options?: FieldArrayMethodProps,
  ) => void;
  fields: FieldArrayWithId<TFieldValues, TName, TKeyName>[];
};
