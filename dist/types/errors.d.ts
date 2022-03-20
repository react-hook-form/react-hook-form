import { FieldValues, InternalFieldName, Ref } from './fields';
import { DeepMap, DeepPartial, LiteralUnion } from './utils';
import { RegisterOptions, ValidateResult } from './validator';
export declare type Message = string;
export declare type MultipleFieldErrors = {
    [K in keyof RegisterOptions]?: ValidateResult;
} & {
    [key: string]: ValidateResult;
};
export declare type FieldError = {
    type: LiteralUnion<keyof RegisterOptions, string>;
    ref?: Ref;
    types?: MultipleFieldErrors;
    message?: Message;
};
export declare type ErrorOption = {
    message?: Message;
    type?: LiteralUnion<keyof RegisterOptions, string>;
    types?: MultipleFieldErrors;
};
export declare type FieldErrors<TFieldValues extends FieldValues = FieldValues> = DeepMap<DeepPartial<TFieldValues>, FieldError>;
export declare type InternalFieldErrors = Partial<Record<InternalFieldName, FieldError>>;
//# sourceMappingURL=errors.d.ts.map