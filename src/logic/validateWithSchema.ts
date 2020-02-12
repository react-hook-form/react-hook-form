import appendErrors from './appendErrors';
import isArray from '../utils/isArray';
import transformToNestObject from './transformToNestObject';
import {
  FieldValues,
  SchemaValidateOptions,
  FieldErrors,
  ValidationResolver,
} from '../types';

type SchemaValidationResult<FormValues> = {
  errors: FieldErrors<FormValues>;
  values: FieldValues;
};

type YupValidationError = {
  inner: { path: string; message: string; type: string }[];
  path: string;
  message: string;
  type: string;
};

type Schema<Data> = {
  validate(value: FieldValues, options?: SchemaValidateOptions): Promise<Data>;
};

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
                [path]: previous[path] || {
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

export default async function validateWithSchema<FormValues, ValidationContext>(
  validationSchema: Schema<FormValues>,
  validateAllFieldCriteria: boolean,
  data: FormValues,
  validationResolver?: ValidationResolver<FormValues, ValidationContext>,
  context?: ValidationContext,
): Promise<SchemaValidationResult<FormValues>> {
  if (validationResolver) {
    return validationResolver(data, context);
  }

  try {
    return {
      values: await validationSchema.validate(data, {
        abortEarly: false,
        context,
      }),
      errors: {},
    };
  } catch (e) {
    return {
      values: {},
      errors: transformToNestObject(
        parseErrorSchema<FormValues>(e, validateAllFieldCriteria),
      ),
    };
  }
}
