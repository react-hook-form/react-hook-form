export default (values: any): boolean => values && values.constructor === Object && Object.keys(values).length === 0;
