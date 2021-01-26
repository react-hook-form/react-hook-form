import { Field } from '../types';

export default (
  value: any,
  { valueAsNumber, valueAsDate, setValueAs }: Field['_f'],
  shouldReturnAsValue?: boolean,
) =>
  shouldReturnAsValue
    ? valueAsNumber
      ? value === ''
        ? NaN
        : +value
      : valueAsDate
      ? new Date(value)
      : setValueAs
      ? setValueAs(value)
      : value
    : value;
