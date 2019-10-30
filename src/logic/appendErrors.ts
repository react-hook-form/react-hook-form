import { FieldErrors } from '../types';

export default <FormValues>(
  name: string,
  returnSingleError: boolean,
  errors: FieldErrors<FormValues>,
  type: string,
  message: string | undefined,
) => {
  if (returnSingleError) {
    return {};
  }
  const error = errors[name] || { types: {}, messages: {} };

  return {
    ...error,
    types: {
      ...error.types,
      [type]: true,
    },
    messages: {
      ...error.messages,
      [type]: message,
    },
  };
};
