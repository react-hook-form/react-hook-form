import { ErrorMessages, DataType } from '../types';

export default <Data extends DataType>(errors: ErrorMessages<Data>): ErrorMessages<Data> =>
  Object.entries(errors).reduce((previous: ErrorMessages<Data>, [key, value]): ErrorMessages<Data> => {
    if (value.type) previous[key] = value;
    return previous;
  }, {});
