import { CriteriaMode, FieldName, FieldRefs, InternalFieldName } from '../types';
declare const _default: <TFieldValues>(fieldsNames: Set<InternalFieldName> | InternalFieldName[], _fields: FieldRefs, criteriaMode?: CriteriaMode | undefined, shouldUseNativeValidation?: boolean | undefined) => {
    criteriaMode: CriteriaMode | undefined;
    names: FieldName<TFieldValues>[];
    fields: Record<string, {
        ref: import("../types").Ref;
        name: string;
        refs?: HTMLInputElement[] | undefined;
        mount?: boolean | undefined;
    } & Partial<{
        required: string | import("../types").ValidationRule<boolean>;
        min: import("../types").ValidationRule<string | number>;
        max: import("../types").ValidationRule<string | number>;
        maxLength: import("../types").ValidationRule<number>;
        minLength: import("../types").ValidationRule<number>;
        pattern: import("../types").ValidationRule<RegExp>;
        validate: import("../types").Validate<any> | Record<string, import("../types").Validate<any>>;
        valueAsNumber: boolean;
        valueAsDate: boolean;
        value: any;
        setValueAs: (value: any) => any;
        shouldUnregister?: boolean | undefined;
        onChange?: ((event: any) => void) | undefined;
        onBlur?: ((event: any) => void) | undefined;
        disabled: boolean;
        deps: string | string[];
    }>>;
    shouldUseNativeValidation: boolean | undefined;
};
export default _default;
//# sourceMappingURL=getResolverOptions.d.ts.map