import { DeepMap, LiteralUnion } from './utils';
import { FieldValues, InternalFieldName, Ref } from './fields';
import { Message } from './form';
import { ValidateResult, RegisterOptions } from './validator';

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

export type FieldErrors<
  TFieldValues extends FieldValues = FieldValues
> = DeepMap<TFieldValues, FieldError>;

export type InternalFieldErrors<TFieldValues extends FieldValues> = Partial<
  Record<InternalFieldName<TFieldValues>, FieldError>
>;
