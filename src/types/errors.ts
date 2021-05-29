import { FieldValues, InternalFieldName, Ref } from './fields';
import { DeepMap, LiteralUnion } from './utils';
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

export type ErrorOption =
  | {
      types: MultipleFieldErrors;
      shouldFocus?: boolean;
    }
  | {
      message?: Message;
      type?: LiteralUnion<keyof RegisterOptions, string>;
      shouldFocus?: boolean;
    };

export type FieldErrors<TFieldValues extends FieldValues = FieldValues> =
  DeepMap<TFieldValues, FieldError>;

export type InternalFieldErrors = Partial<
  Record<InternalFieldName, FieldError>
>;
