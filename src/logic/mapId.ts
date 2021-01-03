import { FieldValues } from '../types';
import isEmptyObject from '../utils/isEmptyObject';
import generateId from './generateId';

const mapIds = <
  TFieldArrayValues extends FieldValues = FieldValues,
  TKeyName extends string = 'id'
>(
  values: Partial<TFieldArrayValues>[] = [],
  keyName: TKeyName,
  skipWarn?: boolean,
): any => {
  if (process.env.NODE_ENV !== 'production') {
    if (!skipWarn) {
      for (const value of values) {
        if (typeof value === 'object' && !isEmptyObject(value)) {
          if (keyName in value) {
            console.warn(
              `📋 useFieldArray fieldValues contain the keyName \`${keyName}\` which is reserved for use by useFieldArray. https://react-hook-form.com/api#useFieldArray`,
            );

            break;
          }
        } else {
          console.warn(
            `📋 useFieldArray input's name should be in object shape instead of flat array. https://react-hook-form.com/api#useFieldArray`,
          );

          break;
        }
      }
    }
  }

  return values.map((value: Partial<TFieldArrayValues>) => ({
    [keyName]: value[keyName] || generateId(),
    ...value,
  }));
};

export default mapIds;
