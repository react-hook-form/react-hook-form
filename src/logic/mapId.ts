import { FieldArrayPath, FieldArrayWithId, FieldValues } from '../types';

import generateId from './generateId';

export default <
  TFieldArrayValues extends FieldValues = FieldValues,
  TFieldName extends FieldArrayPath<TFieldArrayValues> = FieldArrayPath<TFieldArrayValues>,
  TKeyName extends string = 'id',
>(
  values: Partial<TFieldArrayValues>[] = [],
  keyName: TKeyName,
): Partial<FieldArrayWithId<TFieldArrayValues, TFieldName, TKeyName>>[] =>
  values.map((value: Partial<TFieldArrayValues>) => ({
    ...(value[keyName] ? {} : { [keyName]: generateId() }),
    ...value,
  })) as Partial<FieldArrayWithId<TFieldArrayValues, TFieldName, TKeyName>>[];
