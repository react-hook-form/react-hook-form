import { ErrorMessages, DataType } from '../types';

export default <Data extends DataType>(errors: ErrorMessages<Data>): ErrorMessages<Data> =>
  Object.entries(errors).reduce((previous, [key, value]) => {
    if (value.isManual && value.type) previous[key] = value;
    return previous;
  }, {} as ErrorMessages<Data>);
