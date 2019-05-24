import { ErrorMessages } from '../types';

export default (errors: ErrorMessages): ErrorMessages =>
  Object.entries(errors).reduce((previous, [key, value]): ErrorMessages => {
    if (value.isManual && value.type) previous[key] = value;
    return previous;
  }, {});
