import appendErrors from './appendErrors';
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
  validateAllFieldCriteria: boolean,
): FieldErrors<FormValues> =>
  error.inner.length
    ? error.inner.reduce(
        (previous: FieldValues, { path, message, type }: FieldValues) => ({
          ...previous,
          ...(previous[path] && validateAllFieldCriteria
            ? {
                [path]: appendErrors(
                  path,
                  validateAllFieldCriteria,
                  previous,
                  type,
                  message,
                ),
              }
            : {
                [path]: {
                  message,
                  ref: {},
                  type,
                  ...(validateAllFieldCriteria
                    ? {
                        types: { [type]: true },
                        messages: { [type]: message },
                      }
                    : {}),
                },
              }),
        }),
        {},
      )
    : {
        [error.path]: { message: error.message, ref: {}, type: error.type },
      };

export default async function validateWithSchema<FormValues>(
  validationSchema: Schema<FormValues>,
  validationSchemaOption: SchemaValidateOptions,
  validateAllFieldCriteria: boolean,
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
      fieldErrors: parseErrorSchema<FormValues>(e, validateAllFieldCriteria),
    };
  }
}
