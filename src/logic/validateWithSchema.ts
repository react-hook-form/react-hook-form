import {
  FieldValues,
  FieldErrors,
  ValidationReturn,
  SchemaValidateOptions,
  Schema,
} from '../types';

export const parseErrorSchema = (error: FieldValues): FieldErrors =>
  error.inner.reduce(
    (
      previous: FieldValues,
      { path, message, type }: FieldValues,
    ): FieldErrors => ({
      ...previous,
      [path]: { message, ref: {}, type },
    }),
    {},
  );

export default async function validateWithSchema<FormValues>(
  validationSchema: Schema<FormValues>,
  validationSchemaOption: SchemaValidateOptions,
  data: FieldValues,
): Promise<ValidationReturn> {
  try {
    return {
      result: await validationSchema.validate(data, validationSchemaOption),
      fieldErrors: {},
    };
  } catch (e) {
    return {
      result: {},
      fieldErrors: parseErrorSchema(e),
    };
  }
}
