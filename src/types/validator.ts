import { Message } from './form';

export type ValidationValue = boolean | number | string | RegExp;

export type ValidationRule<
  TValidationValue extends ValidationValue = ValidationValue
> = TValidationValue | ValidationValueMessage<TValidationValue>;

export type ValidationValueMessage<
  TValidationValue extends ValidationValue = ValidationValue
> = {
  value: TValidationValue;
  message: Message;
};

export type ValidateResult = Message | Message[] | boolean | undefined;

export type Validate = (data: any) => ValidateResult | Promise<ValidateResult>;

export type RegisterOptions = Partial<{
  required: Message | ValidationRule<boolean>;
  min: ValidationRule<number | string>;
  max: ValidationRule<number | string>;
  maxLength: ValidationRule<number | string>;
  minLength: ValidationRule<number | string>;
  pattern: ValidationRule<RegExp>;
  validate: Validate | Record<string, Validate>;
  valueAsNumber: boolean;
  valueAsDate: boolean;
  setValueAs: (value: any) => any;
}>;
