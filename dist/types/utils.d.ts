import { NestedValue } from './form';
export declare type Noop = () => void;
interface File extends Blob {
    readonly lastModified: number;
    readonly name: string;
}
interface FileList {
    readonly length: number;
    item(index: number): File | null;
    [index: number]: File;
}
export declare type Primitive = null | undefined | string | number | boolean | symbol | bigint;
export declare type EmptyObject = {
    [K in string | number]: never;
};
export declare type NonUndefined<T> = T extends undefined ? never : T;
export declare type LiteralUnion<T extends U, U extends Primitive> = T | (U & {
    _?: never;
});
export declare type DeepPartial<T> = T extends Date | FileList | File | NestedValue ? T : {
    [K in keyof T]?: DeepPartial<T[K]>;
};
export declare type DeepPartialSkipArrayKey<T> = T extends Date | FileList | File | NestedValue ? T : T extends ReadonlyArray<any> ? {
    [K in keyof T]: DeepPartialSkipArrayKey<T[K]>;
} : {
    [K in keyof T]?: DeepPartialSkipArrayKey<T[K]>;
};
/**
 * Checks whether the type is any
 * See {@link https://stackoverflow.com/a/49928360/3406963}
 * @typeParam T - type which may be any
 * ```
 * IsAny<any> = true
 * IsAny<string> = false
 * ```
 */
export declare type IsAny<T> = 0 extends 1 & T ? true : false;
/**
 * Checks whether the type is never
 * @typeParam T - type which may be never
 * ```
 * IsAny<never> = true
 * IsAny<string> = false
 * ```
 */
export declare type IsNever<T> = [T] extends [never] ? true : false;
export declare type DeepMap<T, TValue> = IsAny<T> extends true ? any : T extends Date | FileList | File | NestedValue ? TValue : T extends object ? {
    [K in keyof T]: DeepMap<NonUndefined<T[K]>, TValue>;
} : TValue;
export declare type IsFlatObject<T extends object> = Extract<Exclude<T[keyof T], NestedValue | Date | FileList>, any[] | object> extends never ? true : false;
export {};
//# sourceMappingURL=utils.d.ts.map