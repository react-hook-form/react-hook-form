import { FieldValues } from './fields';
import { Control } from './form';
import { Auto, FieldPathValue, PathString } from './path';

export type UseFieldArrayProps<
  TFieldValues extends FieldValues,
  TFieldArrayName extends PathString,
> = {
  name: Auto.FieldArrayPath<TFieldValues, TFieldArrayName>;
  control?: Control<TFieldValues>;
  unregister?: boolean;
};

export type FieldArrayWithId<
  TFieldValues extends FieldValues,
  TFieldArrayName extends PathString,
> = FieldArray<TFieldValues, TFieldArrayName> & Record<'id', string>;

export type FieldArray<
  TFieldValues extends FieldValues,
  TFieldArrayName extends PathString,
> = FieldPathValue<TFieldValues, TFieldArrayName> extends
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
  TFieldValues extends FieldValues,
  TFieldArrayName extends PathString,
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
