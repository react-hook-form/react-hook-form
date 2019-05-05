export default (values): boolean => values.constructor === Object && Object.keys(values).length === 0;
