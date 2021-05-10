import { Message } from './errors';
import { FieldValues } from './fields';
import { FieldPath, FieldPathValue } from './utils';

export type ValidationValue = boolean | number | string | RegExp;

export type ValidationRule<
  TValidationValue extends ValidationValue = ValidationValue,
> = TValidationValue | ValidationValueMessage<TValidationValue>;

export type ValidationValueMessage<
  TValidationValue extends ValidationValue = ValidationValue,
> = {
  value: TValidationValue;
  message: Message;
};

export type ValidateResult = Message | boolean | undefined;

export type Validate<TFieldValue> = (
  value: TFieldValue,
) => ValidateResult | Promise<ValidateResult>;

export type RegisterOptions<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Partial<{
  required: Message | ValidationRule<boolean>;
  min: ValidationRule<number | string>;
  max: ValidationRule<number | string>;
  maxLength: ValidationRule<number | string>;
  minLength: ValidationRule<number | string>;
  pattern: ValidationRule<RegExp>;
  validate:
    | Validate<FieldPathValue<TFieldValues, TFieldName>>
    | Record<string, Validate<FieldPathValue<TFieldValues, TFieldName>>>;
  valueAsNumber: boolean;
  valueAsDate: boolean;
  setValueAs: (value: any) => any;
  shouldUnregister?: boolean;
}>;
