import { DataType, ValidationReturn } from '../types';

export const parseErrorSchema = (
  isYup: boolean,
  error: DataType,
): ValidationReturn =>
  (isYup ? error.inner : Object.entries(error)).reduce(
    (
      previous: DataType,
      current: DataType,
      index: number,
    ): ValidationReturn => {
      previous[isYup ? current.path : current[0]] = isYup
        ? error.errors[index]
        : current[1];
      return previous;
    },
    {},
  );

export default async function validateWithSchema(
  ValidationSchema: any,
  data: DataType,
): Promise<ValidationReturn> {
  const isYup = ValidationSchema.constructor.name === 'ObjectSchema';
  try {
    const result = await ValidationSchema.validate(data, { abortEarly: false });
    if (!isYup) throw result;
    return {};
  } catch (e) {
    return parseErrorSchema(isYup, e);
  }
}
