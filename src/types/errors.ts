import { FieldValues, InternalFieldName, Ref } from './fields';
import { BrowserNativeObject, IsAny, LiteralUnion, Merge } from './utils';
import { RegisterOptions, ValidateResult } from './validator';

export type Message = string;

export type MultipleFieldErrors = {
  [K in keyof RegisterOptions]?: ValidateResult;
} & {
  [key: string]: ValidateResult;
};

export type FieldError = {
  type: LiteralUnion<keyof RegisterOptions, string>;
  root?: FieldError;
  ref?: Ref;
  types?: MultipleFieldErrors;
  message?: Message;
};

export type ErrorOption = {
  message?: Message;
  type?: LiteralUnion<keyof RegisterOptions, string>;
  types?: MultipleFieldErrors;
};

export type DeepRequired<T> = T extends BrowserNativeObject | Blob
  ? T
  : {
      [K in keyof T]-?: NonNullable<DeepRequired<T[K]>>;
    };

export type FieldErrorsImpl<T extends FieldValues = FieldValues> = {
  [K in keyof T]?: K extends 'root' | `root.${string}`
    ? GlobalError
    : NestedFieldError<T[K]>;
};

export type NestedFieldError<T> = T extends BrowserNativeObject | Blob
  ? FieldError
  : T extends object
  ? Merge<FieldError, FieldErrorsImpl<T>>
  : FieldError;

export type GlobalError = Partial<{
  type: string | number;
  message: Message;
}>;

export type FieldErrors<T extends FieldValues = FieldValues> = Partial<
  FieldValues extends IsAny<FieldValues>
    ? any
    : FieldErrorsImpl<DeepRequired<T>>
> & {
  root?: Record<string, GlobalError> & GlobalError;
};

export type InternalFieldErrors = Partial<
  Record<InternalFieldName, FieldError>
>;
