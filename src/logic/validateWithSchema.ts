import { DataType, ValidationReturn } from '../types';

export function parseErrorSchema(error: DataType): ValidationReturn {
  return error.inner.reduce(
    (
      previous: DataType,
      current: DataType,
      index: number,
    ): ValidationReturn => {
      previous[current.path] = error.errors[index];
      return previous;
    },
    {},
  );
}

export default async function validateWithSchema(
  ValidationSchema: any,
  data: DataType,
): Promise<ValidationReturn> {
  try {
    await ValidationSchema.validate(data, { abortEarly: false });
    return {};
  } catch (e) {
    return parseErrorSchema(e);
  }
}
