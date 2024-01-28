export default (value: string) =>
  Number.isNaN(Number(value)) ? undefined : Number(value);
