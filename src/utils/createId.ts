import uuid from './uuid';

export default (id?: string) => id || `form-${uuid()}`;
