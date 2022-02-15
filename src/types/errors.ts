import { FieldValues, InternalFieldName, Ref } from './fields';
import { LiteralUnion } from './utils';
import { RegisterOptions, ValidateResult } from './validator';

export type Message = string;

export type MultipleFieldErrors = {
  [K in keyof RegisterOptions]?: ValidateResult;
} & {
  [key: string]: ValidateResult;
};

export type FieldError = {
  type: LiteralUnion<keyof RegisterOptions, string>;
  ref?: Ref;
  types?: MultipleFieldErrors;
  message?: Message;
};

export type ErrorOption = {
  message?: Message;
  type?: LiteralUnion<keyof RegisterOptions, string>;
  types?: MultipleFieldErrors;
};

type Merge<A, B> = {
  [K in keyof A | keyof B]?: K extends keyof A
    ? K extends keyof B
      ? [A[K], B[K]] extends [object, object]
        ? Merge<A[K], B[K]>
        : A[K] | B[K]
      : A[K]
    : K extends keyof B
    ? B[K]
    : never;
};

export type FieldErrors<T extends FieldValues = FieldValues> = {
  [K in keyof T]?: T[K] extends object
    ? Merge<FieldError, FieldErrors<T[K]>>
    : FieldError;
};

export type InternalFieldErrors = Partial<
  Record<InternalFieldName, FieldError>
>;
