import { FieldValues } from './fields';
import { Control } from './form';
import { FieldArrayPath, FieldArrayPathValue } from './path';

export type FieldArrayName = string;

export type UseFieldArrayProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
> = {
  name: TFieldArrayName;
  control?: Control<TFieldValues>;
  unregister?: boolean;
};

export type FieldArrayWithId<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
> = FieldArray<TFieldValues, TFieldArrayName> & Record<'id', string>;

export type FieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
> = FieldArrayPathValue<TFieldValues, TFieldArrayName> extends
  | ReadonlyArray<infer U>
  | null
  | undefined
  ? U
  : never;

export type FieldArrayMethodProps = {
  focus?: boolean;
  focusIndex?: number;
  focusName?: string;
};

export type UseFieldArrayReturn<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
> = {
  swap: (indexA: number, indexB: number) => void;
  move: (indexA: number, indexB: number) => void;
  prepend: (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => void;
  append: (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => void;
  remove: (index?: number | number[]) => void;
  insert: (
    index: number,
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => void;
  update: (
    index: number,
    value: Partial<FieldArray<TFieldValues, TFieldArrayName>>,
  ) => void;
  replace: (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
  ) => void;
  fields: FieldArrayWithId<TFieldValues, TFieldArrayName>[];
};
