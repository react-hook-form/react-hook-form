import { ControllerProps, FieldValues, PathString } from './types';
import { useController } from './useController';

const Controller = <TFieldValues extends FieldValues, TName extends PathString>(
  props: ControllerProps<TFieldValues, TName>,
) => props.render(useController(props));

export { Controller };
