import { FieldErrors } from '../types';

export default <FormValues>(
  errors: FieldErrors<FormValues>,
  pickList: (keyof FormValues)[],
): FieldErrors<FormValues> =>
  Object.entries(errors).reduce(
    (previous, [key, error]) => ({
      ...previous,
      ...(pickList.includes(key as keyof FormValues) ? { [key]: error } : null),
    }),
    {},
  );
