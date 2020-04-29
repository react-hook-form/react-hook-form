export default <T = any>(value: unknown): value is T[] => Array.isArray(value);
