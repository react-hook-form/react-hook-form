import { FieldErrors } from '../types';

export default <FormValues>(
  name: string,
  returnSingleError: boolean,
  error: FieldErrors<FormValues>,
  type: string,
  message: string | undefined,
) => {
  if (returnSingleError) {
    return {};
  }
  const singleError = error[name] || { types: {}, messages: {} };

  return {
    ...singleError,
    types: {
      ...singleError.types,
      [type]: true,
    },
    messages: {
      ...singleError.messages,
      [type]: message,
    },
  };
};
