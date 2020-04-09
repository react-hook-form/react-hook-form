import isUndefined from '../utils/isUndefined';

// todo: remove index in the final commit
export const isMatchFieldArrayName = (
  name: string,
  searchName: string,
  index?: number,
) =>
  RegExp(
    `^${searchName}[${isUndefined(index) ? `\\d+` : index}]`
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]'),
  ).test(name);

export default (names: Set<string>, name: string) =>
  [...names].reduce(
    (prev, current) => (isMatchFieldArrayName(name, current) ? true : prev),
    false,
  );
