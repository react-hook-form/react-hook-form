import { Field } from '../types';
import isUndefined from '../utils/isUndefined';

export default (
  value: any,
  { valueAsNumber, valueAsDate, setValueAs }: Field['_f'],
) =>
  isUndefined(value)
    ? value
    : valueAsNumber
    ? value === ''
      ? NaN
      : +value
    : valueAsDate
    ? new Date(value)
    : setValueAs
    ? setValueAs(value)
    : value;
