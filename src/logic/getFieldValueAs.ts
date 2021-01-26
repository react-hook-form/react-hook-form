export default (
  value: any,
  valueAsNumber?: boolean,
  valueAsDate?: boolean,
  setValueAs?: any,
) =>
  valueAsNumber
    ? value === ''
      ? NaN
      : +value
    : valueAsDate
    ? new Date(value)
    : setValueAs
    ? setValueAs(value)
    : value;
