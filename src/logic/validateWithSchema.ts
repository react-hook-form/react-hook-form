import {
  FieldValues,
  SchemaValidationResult,
  SchemaValidateOptions,
  Schema,
  Errors,
} from '../types';

export const parseErrorSchema = <FormValues>(
  error: FieldValues,
): Errors<FormValues> =>
  error.inner.reduce(
    (previous: FieldValues, { path, message, type }: FieldValues) => ({
      ...previous,
      [path]: { message, ref: {}, type },
    }),
    {},
  );

export default async function validateWithSchema<FormValues>(
  validationSchema: Schema<FormValues>,
  validationSchemaOption: SchemaValidateOptions,
  data: FieldValues,
): Promise<SchemaValidationResult<FormValues>> {
  try {
    return {
      result: await validationSchema.validate(data, validationSchemaOption),
      fieldErrors: {},
    };
  } catch (e) {
    return {
      result: {},
      fieldErrors: parseErrorSchema<FormValues>(e),
    };
  }
}
