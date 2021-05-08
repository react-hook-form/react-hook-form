import { RegisterOptions } from '../types';

export default <T extends RegisterOptions>(options?: T, mounted?: boolean) =>
  options &&
  mounted &&
  (options.required ||
    options.min ||
    options.max ||
    options.maxLength ||
    options.minLength ||
    options.pattern ||
    options.validate);
