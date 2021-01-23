import { useController } from './useController';
import { ControllerProps, FieldValues } from './types';

const Controller = <TFieldValues extends FieldValues = FieldValues>(
  props: ControllerProps<TFieldValues>,
) => props.render(useController(props));

export { Controller };
