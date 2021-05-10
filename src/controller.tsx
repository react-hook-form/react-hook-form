import { ControllerProps, FieldPath, FieldValues } from './types';
import { useController } from './useController';

const Controller = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: ControllerProps<TFieldValues, TName>,
) => props.render(useController<TFieldValues, TName>(props));

export { Controller };
