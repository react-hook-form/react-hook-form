import { IsFlatObject } from './utils';
import { RegisterOptions } from './validator';

export type InternalFieldName = string;

export type FieldName<
  TFieldValues extends FieldValues
> = IsFlatObject<TFieldValues> extends true
  ? Extract<keyof TFieldValues, string>
  : string;

export type CustomElement<TFieldValues extends FieldValues> = {
  name: FieldName<TFieldValues>;
  type?: string;
  value?: any;
  disabled?: boolean;
  checked?: boolean;
  options?: HTMLOptionsCollection;
  files?: FileList | null;
  focus?: () => void;
};

export type FieldValue<
  TFieldValues extends FieldValues
> = TFieldValues[InternalFieldName];

export type FieldValues = Record<string, any>;

export type FieldElement<TFieldValues extends FieldValues = FieldValues> =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | CustomElement<TFieldValues>;

export type Ref = FieldElement;

export type Field = {
  __field: {
    ref: Ref;
    name: InternalFieldName;
    value?: any;
    refs?: HTMLInputElement[];
  } & RegisterOptions;
};

export type FieldRefs = Partial<Record<InternalFieldName, Field>>;
