import {
  FieldValues,
  SchemaValidationResult,
  SchemaValidateOptions,
  Schema,
  FieldErrors,
} from '../types';
import appendErrors from './appendErrors';

// TODO: Fix these types
export const parseErrorSchema = <FormValues>(
  error: FieldValues,
  returnSingleError: boolean,
): FieldErrors<FormValues> =>
  error.inner.length
    ? error.inner.reduce(
        (previous: FieldValues, { path, message, type }: FieldValues) => ({
          ...previous,
          ...(previous[path] && !returnSingleError
            ? {
                [path]: appendErrors(
                  path,
                  returnSingleError,
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
                  ...(!returnSingleError
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
  returnSingleError = true,
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
      fieldErrors: parseErrorSchema<FormValues>(e, returnSingleError),
    };
  }
}
