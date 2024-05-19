/**
 * Checks if a string is a valid key consisting of alphanumeric
 * characters and underscores.
 * @remarks (\w qualify _ as a valid character)
 * @example
 * isKey("valid_key")    // Output: true
 * isKey("invalid key!") // Output: false
 */
export default (value: string) => /^\w*$/.test(value);
