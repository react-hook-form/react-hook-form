import { useController } from './useController';
import { ControllerProps, FieldPath, FieldValues } from './types';

const Controller = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: ControllerProps<TFieldValues, TName>,
) => props.render(useController(props));

export { Controller };
