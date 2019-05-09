export default (values): boolean => values && values.constructor === Object && Object.keys(values).length === 0;
