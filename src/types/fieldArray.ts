import { Control } from './form';
import { FieldValues, InternalFieldName } from './fields';

export type UseFieldArrayOptions<
  TFieldArrayValues extends FieldValues = FieldValues,
  TKeyName extends string = 'id'
> = {
  name: InternalFieldName<TFieldArrayValues>;
  keyName?: TKeyName;
  control?: Control<TFieldArrayValues>;
};

export type ArrayField<
  TFieldArrayValues extends FieldValues = FieldValues,
  TKeyName extends string = 'id'
> = TFieldArrayValues & Record<TKeyName, string>;

export type UseFieldArrayMethods<
  TFieldArrayValues extends FieldValues = FieldValues,
  TKeyName extends string = 'id'
> = {
  swap: (indexA: number, indexB: number) => void;
  move: (indexA: number, indexB: number) => void;
  prepend: (
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
    shouldFocus?: boolean,
  ) => void;
  append: (
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
    shouldFocus?: boolean,
  ) => void;
  remove: (index?: number | number[]) => void;
  insert: (
    index: number,
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
    shouldFocus?: boolean,
  ) => void;
  fields: Partial<ArrayField<TFieldArrayValues, TKeyName>>[];
};
