import { DeepMap, LiteralUnion } from './utils';
import { FieldValues, InternalFieldName, Ref } from './fields';
import { Message } from './form';
import { ValidateResult, ValidationRules } from './validator';

export type MultipleFieldErrors = {
  [K in keyof ValidationRules]?: ValidateResult;
} & {
  [key: string]: ValidateResult;
};

export type FieldError = {
  type: LiteralUnion<keyof ValidationRules, string>;
  ref?: Ref;
  types?: MultipleFieldErrors;
  message?: Message;
};

export type ErrorOption =
  | {
      types: MultipleFieldErrors;
    }
  | {
      message?: Message;
      type?: LiteralUnion<keyof ValidationRules, string>;
    };

export type FieldErrors<
  TFieldValues extends FieldValues = FieldValues
> = DeepMap<TFieldValues, FieldError>;

export type InternalFieldErrors<TFieldValues extends FieldValues> = Partial<
  Record<InternalFieldName<TFieldValues>, FieldError>
>;
