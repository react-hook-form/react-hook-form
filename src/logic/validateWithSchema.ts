import {
  Schema,
  ValidationReturn,
  TFormValues,
  ValidationError,
  FieldErrors,
} from '../types';

export function parseErrorSchema<FormValues extends TFormValues = TFormValues>(
  error: ValidationError,
) {
  return error.inner.reduce<Partial<FieldErrors<FormValues>>>(
    (previous, { path, message, type }: ValidationError) => ({
      ...previous,
      [path]: { message, ref: {}, type },
    }),
    {},
  );
}

export default async function validateWithSchema<
  FormValues extends TFormValues = TFormValues
>(
  ValidationSchema: Schema<FormValues>,
  data: FormValues,
): Promise<ValidationReturn<FormValues>> {
  try {
    return {
      result: await ValidationSchema.validate(data, { abortEarly: false }),
      fieldErrors: {},
    };
  } catch (err) {
    return {
      // @ts-ignore
      fieldErrors: parseErrorSchema(err),
      result: {},
    };
  }
}
