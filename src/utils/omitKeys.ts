import { FieldArrayWithId } from '../types';

import omit from './omit';

export default <T extends Partial<FieldArrayWithId>[]>(
  fields: T,
  keyName: string,
) => fields.map((field = {}) => omit(field, keyName));
