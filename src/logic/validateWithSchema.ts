import appendErrors from './appendErrors';
import isArray from '../utils/isArray';
import {
  FieldValues,
  SchemaValidateOptions,
  FieldErrors,
  SchemaResolver,
} from '../types';

interface SchemaValidationResult<FormValues> {
  errors: FieldErrors<FormValues>;
  values: FieldValues;
}

interface YupValidationError {
  inner: { path: string; message: string; type: string }[];
  path: string;
  message: string;
  type: string;
}

interface Schema<Data> {
  validate(value: FieldValues, options?: SchemaValidateOptions): Promise<Data>;
}

export const parseErrorSchema = <FormValues>(
  error: YupValidationError,
  validateAllFieldCriteria: boolean,
): FieldErrors<FormValues> =>
  isArray(error.inner)
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
                  type,
                  ...(validateAllFieldCriteria
                    ? {
                        types: { [type]: message || true },
                      }
                    : {}),
                },
              }),
        }),
        {},
      )
    : {
        [error.path]: { message: error.message, type: error.type },
      };

export default async function validateWithSchema<FormValues>(
  validationSchema: Schema<FormValues> | SchemaResolver<FormValues>,
  validationSchemaOption: SchemaValidateOptions,
  validateAllFieldCriteria: boolean,
  data: FieldValues,
): Promise<SchemaValidationResult<FormValues>> {
  if ((validationSchema as Schema<FormValues>).validate) {
    try {
      return {
        values: await (validationSchema as Schema<FormValues>).validate(
          data,
          validationSchemaOption,
        ),
        errors: {},
      };
    } catch (e) {
      console.log(e);
      return {
        values: {},
        errors: parseErrorSchema<FormValues>(e, validateAllFieldCriteria),
      };
    }
  } else {
    return (validationSchema as SchemaResolver<FormValues>).resolver(data);
  }
}
