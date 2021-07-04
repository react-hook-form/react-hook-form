import { FieldArray, FieldArrayPath, FieldValues } from '../types';

import isUndefined from './isUndefined';

export default <
  TFieldValues extends FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues>,
>(
  data:
    | (TFieldValues | undefined)[]
    | FieldArray<TFieldValues, TFieldArrayName>[],
  value: TFieldValues,
  index?: number,
) => {
  let output;

  if (isUndefined(index)) {
    output = value;
  } else {
    data[index] = value;
    output = data;
  }

  return output;
};
