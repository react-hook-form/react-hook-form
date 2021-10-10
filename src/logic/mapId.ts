import {
  FieldArrayWithId,
  FieldPathWithArrayValue,
  FieldValues,
} from '../types';

import generateId from './generateId';

export default <
  TFieldArrayValues extends FieldValues = FieldValues,
  TResult = any,
  TFieldArrayName extends FieldPathWithArrayValue<
    TFieldArrayValues,
    TResult
  > = FieldPathWithArrayValue<TFieldArrayValues, TResult>,
  TKeyName extends string = 'id',
>(
  values: Partial<TFieldArrayValues>[] = [],
  keyName: TKeyName,
): Partial<
  FieldArrayWithId<TFieldArrayValues, TResult, TFieldArrayName, TKeyName>
>[] =>
  values.map((value: Partial<TFieldArrayValues>) => ({
    ...(value[keyName] ? {} : { [keyName]: generateId() }),
    ...value,
  })) as Partial<
    FieldArrayWithId<TFieldArrayValues, TResult, TFieldArrayName, TKeyName>
  >[];
