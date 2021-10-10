import { FieldValues } from './fields';
import { Control } from './form';
import {
  FieldArrayPath,
  FieldArrayPathValue,
  FieldPathWithArrayValue,
  IsAny,
} from './utils';

export type FieldArrayName = string;

export type UseFieldArrayProps<
  TFieldValues extends FieldValues = FieldValues,
  TResult = any,
  TFieldArrayName extends FieldPathWithArrayValue<
    TFieldValues,
    TResult
  > = FieldPathWithArrayValue<TFieldValues, TResult>,
  TKeyName extends string = 'id',
> = {
  name: TFieldArrayName;
  keyName?: TKeyName;
  control?: Control<TFieldValues>;
  shouldUnregister?: boolean;
};

export type FieldArrayWithId<
  TFieldValues extends FieldValues = FieldValues,
  TResult = any,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
> = FieldArray<TFieldValues, TResult, TFieldArrayName> &
  Record<TKeyName, string>;

export type FieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TResult = any,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
> = IsAny<TResult> extends true
  ? FieldArrayPathValue<TFieldValues, TFieldArrayName> extends ReadonlyArray<
      infer U
    >
    ? U
    : never
  : TResult extends ReadonlyArray<infer U>
  ? U
  : never;

export type FieldArrayMethodProps = {
  shouldFocus?: boolean;
  focusIndex?: number;
  focusName?: string;
};

export type UseFieldArrayReturn<
  TFieldValues extends FieldValues = FieldValues,
  TResult = any,
  TFieldArrayName extends FieldPathWithArrayValue<
    TFieldValues,
    TResult
  > = FieldPathWithArrayValue<TFieldValues, TResult>,
  TKeyName extends string = 'id',
> = {
  swap: (indexA: number, indexB: number) => void;
  move: (indexA: number, indexB: number) => void;
  prepend: (
    value:
      | Partial<FieldArray<TFieldValues, TResult, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TResult, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => void;
  append: (
    value:
      | Partial<FieldArray<TFieldValues, TResult, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TResult, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => void;
  remove: (index?: number | number[]) => void;
  insert: (
    index: number,
    value:
      | Partial<FieldArray<TFieldValues, TResult, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TResult, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => void;
  update: (
    index: number,
    value: Partial<FieldArray<TFieldValues, TResult, TFieldArrayName>>,
  ) => void;
  replace: (
    value:
      | Partial<FieldArray<TFieldValues, TResult, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TResult, TFieldArrayName>>[],
  ) => void;
  fields: FieldArrayWithId<TFieldValues, TResult, TFieldArrayName, TKeyName>[];
};
