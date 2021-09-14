import { FieldValues } from './fields';
import { Control } from './form';
import { FieldArrayPath } from './utils';

export type FieldArrayName = string;

export type UseFieldArrayProps<
  TFieldValues extends FieldValues = FieldValues,
  TResult = unknown,
  TFieldArrayName extends FieldArrayPath<
    TFieldValues,
    TResult
  > = FieldArrayPath<TFieldValues, TResult>,
  TKeyName extends string = 'id',
> = {
  name: TFieldArrayName;
  keyName?: TKeyName;
  control?: Control<TFieldValues>;
  shouldUnregister?: boolean;
};

export type FieldArrayWithId<
  TResult = unknown,
  TKeyName extends string = 'id',
> = TResult & Record<TKeyName, string>;

export type FieldArrayMethodProps = {
  shouldFocus?: boolean;
  focusIndex?: number;
  focusName?: string;
};

export type UseFieldArrayReturn<
  TResult = unknown,
  TKeyName extends string = 'id',
> = {
  swap: (indexA: number, indexB: number) => void;
  move: (indexA: number, indexB: number) => void;
  prepend: (
    value: Partial<TResult> | Partial<TResult>[],
    options?: FieldArrayMethodProps,
  ) => void;
  append: (
    value: Partial<TResult> | Partial<TResult>[],
    options?: FieldArrayMethodProps,
  ) => void;
  remove: (index?: number | number[]) => void;
  insert: (
    index: number,
    value: Partial<TResult> | Partial<TResult>[],
    options?: FieldArrayMethodProps,
  ) => void;
  update: (index: number, value: Partial<TResult>) => void;
  replace: (value: Partial<TResult> | Partial<TResult>[]) => void;
  fields: FieldArrayWithId<TResult, TKeyName>[];
};
