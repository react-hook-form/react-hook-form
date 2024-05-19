import convertToArrayPayload from './convertToArrayPayload';
/**
 * Add's value or an array of values to the beginning of an array.
 */
export default <T>(data: T[], value: T | T[]): T[] => [
  ...convertToArrayPayload(value),
  ...convertToArrayPayload(data),
];
