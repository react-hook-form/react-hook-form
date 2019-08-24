import { FieldValues } from '../types';

export default function flatObject(input: any): FieldValues {
  function flat(res: any, key: any, val: any, pre = ''): any {
    const isNotNumber = Number.isNaN(parseInt(key));
    const prefix = [pre, isNotNumber ? key : `[${key}]`]
      .filter(v => v)
      .join(isNotNumber ? '.' : '');
    return typeof val === 'object'
      ? Object.keys(val).reduce(
          (prev, curr) => flat(prev, curr, val[curr], prefix),
          res,
        )
      : Object.assign(res, { [prefix]: val });
  }

  return Object.keys(input).reduce(
    (prev, curr) => flat(prev, curr, input[curr]),
    {},
  );
}
