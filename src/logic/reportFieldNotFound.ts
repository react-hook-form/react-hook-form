import isUndefined from '../utils/isUndefined';
import { IS_DEV_ENV } from '../constants';

export default (name: any, fields?: any): void => {
  if (IS_DEV_ENV && ((fields && isUndefined(fields[name])) || !fields)) {
    console.error(`${name} field not found.`);
  }
};
