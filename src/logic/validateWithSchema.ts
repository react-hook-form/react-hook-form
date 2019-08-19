import { DataType, FieldErrors, ValidationReturn } from '../types';

export function parseErrorSchema(error: DataType): FieldErrors {
  return error.inner.reduce(
    (previous: DataType, { path, message, type }: DataType): FieldErrors => ({
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
    return {
      result: await ValidationSchema.validate(data, { abortEarly: false }),
      fieldErrors: {},
    };
  } catch (e) {
    return {
      fieldErrors: parseErrorSchema(e),
      result: {},
    };
  }
}
