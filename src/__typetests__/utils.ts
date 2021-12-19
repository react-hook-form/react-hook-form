/**
 * Helper to use tsd without having to create a value.
 * This function doesn't exist, but is statically analyzed by tsd.
 * It's impossible to implement this function.
 * @example
 * ```
 * expectType<number>(type<number>());
 * ```
 */
export declare function type<T>(): T;
