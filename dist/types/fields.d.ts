import { IsFlatObject, Noop } from './utils';
import { RegisterOptions } from './validator';
export declare type InternalFieldName = string;
export declare type FieldName<TFieldValues extends FieldValues> = IsFlatObject<TFieldValues> extends true ? Extract<keyof TFieldValues, string> : string;
export declare type CustomElement<TFieldValues extends FieldValues> = {
    name: FieldName<TFieldValues>;
    type?: string;
    value?: any;
    disabled?: boolean;
    checked?: boolean;
    options?: HTMLOptionsCollection;
    files?: FileList | null;
    focus?: Noop;
};
export declare type FieldValue<TFieldValues extends FieldValues> = TFieldValues[InternalFieldName];
export declare type FieldValues = Record<string, any>;
export declare type NativeFieldValue = string | number | boolean | null | undefined;
export declare type FieldElement<TFieldValues extends FieldValues = FieldValues> = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | CustomElement<TFieldValues>;
export declare type Ref = FieldElement;
export declare type Field = {
    _f: {
        ref: Ref;
        name: InternalFieldName;
        refs?: HTMLInputElement[];
        mount?: boolean;
    } & RegisterOptions;
};
export declare type FieldRefs = Partial<Record<InternalFieldName, Field>>;
//# sourceMappingURL=fields.d.ts.map