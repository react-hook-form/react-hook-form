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
  returnSingleError: boolean,
): FieldErrors<FormValues> =>
  error.inner.length
    ? error.inner.reduce(
        (previous: FieldValues, { path, message, type }: FieldValues) => {
          if (returnSingleError) {
            return {
              ...previous,
              [path]: { message, ref: {}, type },
            };
          } else {
            return {
              ...previous,
              ...(previous[path]
                ? {
                    [path]: {
                      ...previous[path],
                      types: { ...previous[path].types, [type]: true },
                      messages: { ...previous[path].messages, [type]: message },
                    },
                  }
                : {
                    [path]: {
                      message,
                      ref: {},
                      type,
                      types: { [type]: true },
                      messages: { [type]: message },
                    },
                  }),
            };
          }
        },
        {},
      )
    : {
        [error.path]: { message: error.message, ref: {}, type: error.type },
      };

export default async function validateWithSchema<FormValues>(
  validationSchema: Schema<FormValues>,
  validationSchemaOption: SchemaValidateOptions,
  data: FieldValues,
  returnSingleError = true,
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
