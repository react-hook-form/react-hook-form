export default <T>(value: unknown): value is T[] => Array.isArray(value);
