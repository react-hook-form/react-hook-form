import {
  FieldValues,
  SchemaValidationResult,
  SchemaValidateOptions,
  Schema,
  FieldErrors,
} from '../types';

// TODO: Fix these types
export const parseErrorSchema = <FormValues>(
  error: FieldValues,
): FieldErrors<FormValues> =>
  error.inner.length
    ? error.inner.reduce(
        (previous: FieldValues, { path, message, type }: FieldValues) => ({
          ...previous,
          [path]: { message, ref: {}, type },
        }),
        {},
      )
    : {
        [error.path]: { message: error.message, ref: {}, type: error.type },
      };

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
