import isFunction from './isFunction';

export default <T>(data: T) => Object.values(data).some(isFunction);
