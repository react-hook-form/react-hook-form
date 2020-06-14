import * as React from 'react';
import {
  FieldValues,
  NestedValue,
  UnpackNestedValue,
  InternalFieldName,
  FieldValue,
  FieldRefs,
  Field,
  FieldName,
} from './types/form';
import { NonUndefined, DeepPartial, LiteralToPrimitive } from './types/utils';
import isArray from './utils/isArray';
import isString from './utils/isString';
import isObject from './utils/isObject';
import isHTMLElement from './utils/isHTMLElement';
import isNullOrUndefined from './utils/isNullOrUndefined';
import isRadioInput from './utils/isRadioInput';
import isFileInput from './utils/isFileInput';
import isMultipleSelect from './utils/isMultipleSelect';
import isCheckBoxInput from './utils/isCheckBoxInput';
import getFieldValue from './logic/getFieldValue';
import { get } from './utils';
import isEmptyObject from './utils/isEmptyObject';
import isPrimitive from './utils/isPrimitive';
import getFieldsValues from './logic/getFieldsValues';
import { transformToNestObject } from './logic';

interface UseFormValueProps<TFieldValues extends FieldValues = FieldValues> {
  isWeb: boolean;
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>;
  defaultValuesRef: React.MutableRefObject<
    | FieldValue<UnpackNestedValue<TFieldValues>>
    | UnpackNestedValue<DeepPartial<TFieldValues>>
  >;
  isFieldWatched: (name: string) => boolean;
  renderWatchedInputs: (name: string, found?: boolean) => boolean;
  reRender: () => void;
  trigger: (
    name?: FieldName<TFieldValues> | FieldName<TFieldValues>[],
  ) => Promise<boolean>;
  setDirty: (name: InternalFieldName<TFieldValues>) => boolean;
}

export function useFormValue<TFieldValues extends FieldValues = FieldValues>({
  isWeb,
  fieldsRef,
  setDirty,
  defaultValuesRef,
  isFieldWatched,
  renderWatchedInputs,
  reRender,
  trigger,
}: UseFormValueProps<TFieldValues>) {
  const setFieldValue = React.useCallback(
    (
      field: Field,
      rawValue:
        | FieldValue<TFieldValues>
        | UnpackNestedValue<DeepPartial<TFieldValues>>
        | undefined
        | null
        | boolean,
    ) => {
      const { ref, options } = field;
      const value =
        isWeb && isHTMLElement(ref) && isNullOrUndefined(rawValue)
          ? ''
          : rawValue;

      if (isRadioInput(ref) && options) {
        options.forEach(
          ({ ref: radioRef }: { ref: HTMLInputElement }) =>
            (radioRef.checked = radioRef.value === value),
        );
      } else if (isFileInput(ref)) {
        if (isString(value)) {
          ref.value = value;
        } else {
          ref.files = value as FileList;
        }
      } else if (isMultipleSelect(ref)) {
        [...ref.options].forEach(
          (selectRef) =>
            (selectRef.selected = (value as string).includes(selectRef.value)),
        );
      } else if (isCheckBoxInput(ref) && options) {
        options.length > 1
          ? options.forEach(
              ({ ref: checkboxRef }) =>
                (checkboxRef.checked = (value as string).includes(
                  checkboxRef.value,
                )),
            )
          : (options[0].ref.checked = !!value);
      } else {
        ref.value = value;
      }
    },
    [isWeb],
  );

  const setInternalValues = React.useCallback(
    (
      name: InternalFieldName<TFieldValues>,
      value: FieldValue<TFieldValues>,
      parentFieldName?: string,
    ) => {
      for (const key in value) {
        const fieldName = `${parentFieldName || name}${
          isArray(value) ? `[${key}]` : `.${key}`
        }`;
        const field = fieldsRef.current[fieldName];

        if (isObject(value[key])) {
          setInternalValues(name, value[key], fieldName);
        }

        if (field) {
          setFieldValue(field, value[key]);
          setDirty(fieldName);
        }
      }
    },
    [setFieldValue, setDirty, fieldsRef],
  );

  const setInternalValue = React.useCallback(
    (
      name: InternalFieldName<TFieldValues>,
      value: FieldValue<TFieldValues> | null | undefined | boolean,
    ): boolean | void => {
      if (fieldsRef.current[name]) {
        setFieldValue(fieldsRef.current[name] as Field, value);

        return setDirty(name);
      } else if (!isPrimitive(value)) {
        setInternalValues(name, value);
      }
    },
    [setDirty, setFieldValue, setInternalValues, fieldsRef],
  );

  function setValue<
    TFieldName extends string,
    TFieldValue extends TFieldValues[TFieldName]
  >(
    name: TFieldName,
    value: NonUndefined<TFieldValue> extends NestedValue<infer U>
      ? U
      : UnpackNestedValue<DeepPartial<LiteralToPrimitive<TFieldValue>>>,
    shouldValidate?: boolean,
  ): void;
  function setValue<TFieldName extends keyof TFieldValues>(
    namesWithValue: UnpackNestedValue<
      DeepPartial<Pick<TFieldValues, TFieldName>>
    >[],
    shouldValidate?: boolean,
  ): void;
  function setValue<TFieldName extends keyof TFieldValues>(
    names:
      | string
      | UnpackNestedValue<DeepPartial<Pick<TFieldValues, TFieldName>>>[],
    valueOrShouldValidate?: unknown,
    shouldValidate?: boolean,
  ): void {
    let shouldRender = false;
    const isArrayValue = isArray(names);
    const namesInArray = isArrayValue
      ? (names as UnpackNestedValue<
          DeepPartial<Pick<TFieldValues, TFieldName>>
        >[])
      : [names];

    namesInArray.forEach((name: any) => {
      const keyName = isString(name) ? name : Object.keys(name)[0];
      shouldRender =
        setInternalValue(
          keyName,
          isString(name)
            ? valueOrShouldValidate
            : (Object.values(name)[0] as any),
        ) ||
        isArrayValue ||
        isFieldWatched(keyName);
      renderWatchedInputs(keyName);
    });

    if (shouldRender || isArrayValue) {
      reRender();
    }

    if (shouldValidate || (isArrayValue && valueOrShouldValidate)) {
      trigger(isArrayValue ? undefined : (names as any));
    }
  }

  const getValue = <TFieldName extends string, TFieldValue extends unknown>(
    name: TFieldName,
  ): TFieldName extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues>[TFieldName]
    : TFieldValue =>
    fieldsRef.current[name]
      ? getFieldValue(fieldsRef.current, fieldsRef.current[name]!.ref)
      : get(defaultValuesRef.current, name);

  function getValues(): UnpackNestedValue<TFieldValues>;
  function getValues<TFieldName extends string, TFieldValue extends unknown>(
    name: TFieldName,
  ): TFieldName extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues>[TFieldName]
    : TFieldValue;
  function getValues<TFieldName extends keyof TFieldValues>(
    names: TFieldName[],
  ): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
  function getValues(payload?: string | string[]): unknown {
    const fields = fieldsRef.current;
    if (isString(payload)) {
      return getValue(payload);
    }

    if (isArray(payload)) {
      return payload.reduce(
        (previous, name) => ({
          ...previous,
          [name]: getValue(name),
        }),
        {},
      );
    }

    const fieldValues = getFieldsValues(fields);

    return isEmptyObject(fieldValues)
      ? defaultValuesRef.current
      : transformToNestObject(fieldValues);
  }

  return {
    setFieldValue,
    setDirty,
    setInternalValue,
    setValue,
    getValues,
  };
}
