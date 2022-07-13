import { FieldValues, InternalFieldName, Ref } from './fields';
import { LiteralUnion, Merge } from './utils';
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

export type DeepRequired<T> = {
  [K in keyof T]-?: DeepRequired<T[K]>;
};

export type FieldErrorsImpl<T extends FieldValues = FieldValues> = {
  [K in keyof T]?: T[K] extends object
    ? Merge<FieldError, FieldErrorsImpl<T[K]>>
    : FieldError;
};

export type FieldErrors<T extends FieldValues = FieldValues> = FieldErrorsImpl<
  DeepRequired<T>
>;

export type InternalFieldErrors = Partial<
  Record<InternalFieldName, FieldError>
>;
