import {
  DataType,
  FieldErrors,
  ValidationReturn,
  SchemaValidateOptions,
} from '../types';

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
  validationSchema: any,
  validateWithSchema: SchemaValidateOptions,
  data: DataType,
): Promise<ValidationReturn> {
  try {
    return {
      result: await validationSchema.validate(data, validateWithSchema),
      fieldErrors: {},
    };
  } catch (e) {
    return {
      fieldErrors: parseErrorSchema(e),
      result: {},
    };
  }
}
