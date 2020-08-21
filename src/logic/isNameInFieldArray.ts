import { FieldValues, InternalFieldName } from '../types/form';

export const isMatchFieldArrayName = (name: string, searchName: string) =>
  RegExp(
    `^${searchName}[\\d+]`.replace(/\[/g, '\\[').replace(/\]/g, '\\]'),
  ).test(name);

export default (
  names: Set<InternalFieldName<FieldValues>>,
  name: InternalFieldName<FieldValues>,
) => [...names].some((current) => isMatchFieldArrayName(name, current));
