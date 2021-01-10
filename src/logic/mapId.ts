import { FieldValues } from '../types';
import generateId from './generateId';

export default <
  TFieldArrayValues extends FieldValues = FieldValues,
  TKeyName extends string = 'id'
>(
  values: Partial<TFieldArrayValues>[] = [],
  keyName: TKeyName,
): any =>
  values.map((value: Partial<TFieldArrayValues>) => ({
    [keyName]: (value && value[keyName]) || generateId(),
    ...value,
  }));
