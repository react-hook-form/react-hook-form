import { Message } from './errors';
import { FieldValues, InternalFieldName } from './fields';
import { FieldPath, FieldPathValue } from './path';
export declare type ValidationValue = boolean | number | string | RegExp;
export declare type ValidationRule<TValidationValue extends ValidationValue = ValidationValue> = TValidationValue | ValidationValueMessage<TValidationValue>;
export declare type ValidationValueMessage<TValidationValue extends ValidationValue = ValidationValue> = {
    value: TValidationValue;
    message: Message;
};
export declare type ValidateResult = Message | Message[] | boolean | undefined;
export declare type Validate<TFieldValue> = (value: TFieldValue) => ValidateResult | Promise<ValidateResult>;
export declare type RegisterOptions<TFieldValues extends FieldValues = FieldValues, TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = Partial<{
    required: Message | ValidationRule<boolean>;
    min: ValidationRule<number | string>;
    max: ValidationRule<number | string>;
    maxLength: ValidationRule<number>;
    minLength: ValidationRule<number>;
    pattern: ValidationRule<RegExp>;
    validate: Validate<FieldPathValue<TFieldValues, TFieldName>> | Record<string, Validate<FieldPathValue<TFieldValues, TFieldName>>>;
    valueAsNumber: boolean;
    valueAsDate: boolean;
    value: FieldPathValue<TFieldValues, TFieldName>;
    setValueAs: (value: any) => any;
    shouldUnregister?: boolean;
    onChange?: (event: any) => void;
    onBlur?: (event: any) => void;
    disabled: boolean;
    deps: InternalFieldName | InternalFieldName[];
}>;
//# sourceMappingURL=validator.d.ts.map