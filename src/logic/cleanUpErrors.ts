import { ErrorMessages } from '../types';

export default <Data>(errors: ErrorMessages<Data>, fields: string[]) =>
  Object.entries(errors).reduce(
    (result, [field, err]) =>
      fields.some(f => f === field) ? result : { ...result, [field]: err },
    {},
  );
