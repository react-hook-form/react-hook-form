/**
 * Put's given value into an array if it's not already an array.
 */
export default <T>(value: T) => (Array.isArray(value) ? value : [value]);
