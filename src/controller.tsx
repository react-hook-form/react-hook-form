// @ts-nocheck
import { useController } from './useController';
import { ControllerProps, FieldValues } from './types';

const Controller = <TFieldValues extends FieldValues = FieldValues>(
  props: ControllerProps<TFieldValues>,
) => {
  const { field, meta } = useController(props);

  return props.render({ field, meta });
};

export { Controller };
