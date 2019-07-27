import { DataType, ValidationReturn } from '../types';

export function parseErrorSchema(error: DataType): ValidationReturn {
  return error.inner.reduce(
    (
      previous: DataType,
      { path, message, type }: DataType,
    ): ValidationReturn => ({
      ...previous,
      [path]: { message, ref: {}, type },
    }),
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
