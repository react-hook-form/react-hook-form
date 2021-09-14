import { FieldArrayWithId, FieldValues } from '../types';

import generateId from './generateId';

export default <
  TFieldArrayValues extends FieldValues = FieldValues,
  TResult = unknown,
  TKeyName extends string = 'id',
>(
  values: Partial<TFieldArrayValues>[] = [],
  keyName: TKeyName,
): Partial<FieldArrayWithId<TResult, TKeyName>>[] =>
  values.map((value: Partial<TFieldArrayValues>) => ({
    ...(value[keyName] ? {} : { [keyName]: generateId() }),
    ...value,
  })) as Partial<FieldArrayWithId<TResult, TKeyName>>[];
