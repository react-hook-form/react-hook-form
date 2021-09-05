import { ControllerProps, FieldPath, FieldValues } from './types';
import { useController } from './useController';

const Controller = <
  TFieldValues extends FieldValues = FieldValues,
  TResult = unknown,
  TName extends FieldPath<TFieldValues, TResult> = FieldPath<
    TFieldValues,
    TResult
  >,
>(
  props: ControllerProps<TFieldValues, TResult, TName>,
) => props.render(useController<TFieldValues, TResult, TName>(props));

export { Controller };
