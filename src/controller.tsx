import {
  ControllerProps,
  FieldPath,
  FieldPathValue,
  FieldPathWithValue,
  FieldValues,
} from './types';
import { useController } from './useController';

const Controller = <
  TFieldValues extends FieldValues = FieldValues,
  TResult = FieldPathValue<TFieldValues, FieldPath<TFieldValues>>,
  TName extends FieldPathWithValue<TFieldValues, TResult> = FieldPathWithValue<
    TFieldValues,
    TResult
  >,
>(
  props: ControllerProps<TFieldValues, TResult, TName>,
) => props.render(useController<TFieldValues, TResult, TName>(props));

export { Controller };
