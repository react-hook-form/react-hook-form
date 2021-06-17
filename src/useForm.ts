import { useEffect, useRef, useState } from 'react';

import focusFieldBy from './logic/focusFieldBy';
import getFieldsValues from './logic/getFieldsValues';
import getFieldValue from './logic/getFieldValue';
import getFieldValueAs from './logic/getFieldValueAs';
import getNodeParentName from './logic/getNodeParentName';
import getProxyFormState from './logic/getProxyFormState';
import getResolverOptions from './logic/getResolverOptions';
import hasValidation from './logic/hasValidation';
import isNameInFieldArray from './logic/isNameInFieldArray';
import setFieldArrayDirtyFields from './logic/setFieldArrayDirtyFields';
import shouldRenderFormState from './logic/shouldRenderFormState';
import skipValidation from './logic/skipValidation';
import validateField from './logic/validateField';
import compact from './utils/compact';
import convertToArrayPayload from './utils/convertToArrayPayload';
import deepEqual from './utils/deepEqual';
import get from './utils/get';
import getValidationModes from './utils/getValidationModes';
import isCheckBoxInput from './utils/isCheckBoxInput';
import isEmptyObject from './utils/isEmptyObject';
import isFileInput from './utils/isFileInput';
import isFunction from './utils/isFunction';
import isHTMLElement from './utils/isHTMLElement';
import isMultipleSelect from './utils/isMultipleSelect';
import isNullOrUndefined from './utils/isNullOrUndefined';
import isObject from './utils/isObject';
import isPrimitive from './utils/isPrimitive';
import isProxyEnabled from './utils/isProxyEnabled';
import isRadioInput from './utils/isRadioInput';
import isRadioOrCheckboxFunction from './utils/isRadioOrCheckbox';
import isString from './utils/isString';
import isUndefined from './utils/isUndefined';
import isWeb from './utils/isWeb';
import omit from './utils/omit';
import set from './utils/set';
import Subject from './utils/Subject';
import unset from './utils/unset';
import { EVENTS, VALIDATION_MODE } from './constants';
import {
  ChangeHandler,
  DeepPartial,
  DefaultValues,
  Field,
  FieldArrayDefaultValues,
  FieldError,
  FieldNamesMarkedBoolean,
  FieldPath,
  FieldRefs,
  FieldValues,
  FormState,
  GetIsDirty,
  InternalFieldName,
  Names,
  Path,
  PathValue,
  ReadFormState,
  Ref,
  RegisterOptions,
  SetFieldValue,
  SetValueConfig,
  Subjects,
  UnpackNestedValue,
  UseFormClearErrors,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormProps,
  UseFormRegister,
  UseFormRegisterReturn,
  UseFormReset,
  UseFormReturn,
  UseFormSetError,
  UseFormSetFocus,
  UseFormSetValue,
  UseFormTrigger,
  UseFormUnregister,
  UseFormWatch,
  WatchInternal,
  WatchObserver,
} from './types';

const isWindowUndefined = typeof window === 'undefined';

const defaultOptions = {
  mode: VALIDATION_MODE.onSubmit,
  reValidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true,
} as const;

export function createForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
>(
  constructOptions: UseFormProps<TFieldValues, TContext> = {},
): UseFormReturn<TFieldValues> {
  let formOptions = {
    ...defaultOptions,
    ...constructOptions,
  };
  let formStateRef = {
    isDirty: false,
    isValidating: false,
    dirtyFields: {},
    isSubmitted: false,
    submitCount: 0,
    touchedFields: {},
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    errors: {},
  };
  const readFormStateRef = {
    isDirty: !isProxyEnabled,
    dirtyFields: !isProxyEnabled,
    touchedFields: !isProxyEnabled,
    isValidating: !isProxyEnabled,
    isValid: !isProxyEnabled,
    errors: !isProxyEnabled,
  } as ReadFormState;
  let fieldsRef = {} as FieldRefs;
  let defaultValues = (formOptions.defaultValues ||
    {}) as DefaultValues<TFieldValues>;
  let fieldArrayDefaultValuesRef = {} as FieldArrayDefaultValues;
  let inFieldArrayActionRef = false;
  let isMountedRef = false;
  let subjectsRef: Subjects<TFieldValues> = {
    watch: new Subject(),
    control: new Subject(),
    array: new Subject(),
    state: new Subject(),
  };
  let namesRef = {
    mount: new Set(),
    unMount: new Set(),
    array: new Set(),
    watch: new Set(),
    watchAll: false,
  } as Names;

  const validationMode = getValidationModes(formOptions.mode);
  const isValidateAllFieldCriteria =
    formOptions.criteriaMode === VALIDATION_MODE.all;

  const isFieldWatched = (name: FieldPath<TFieldValues>) =>
    namesRef.watchAll ||
    namesRef.watch.has(name) ||
    namesRef.watch.has((name.match(/\w+/) || [])[0]);

  const shouldRenderBaseOnError = async (
    shouldSkipRender: boolean,
    name: InternalFieldName,
    error?: FieldError,
    inputState?: {
      dirty?: FieldNamesMarkedBoolean<TFieldValues>;
      isDirty?: boolean;
      touched?: FieldNamesMarkedBoolean<TFieldValues>;
    },
    isValidFromResolver?: boolean,
    isWatched?: boolean,
  ): Promise<void> => {
    const previousError = get(formStateRef.errors, name);
    const isValid = readFormStateRef.isValid
      ? formOptions.resolver
        ? isValidFromResolver
        : await validateForm(fieldsRef, true)
      : false;

    error
      ? set(formStateRef.errors, name, error)
      : unset(formStateRef.errors, name);

    if (
      (isWatched ||
        (error ? !deepEqual(previousError, error, true) : previousError) ||
        !isEmptyObject(inputState) ||
        formStateRef.isValid !== isValid) &&
      !shouldSkipRender
    ) {
      const updatedFormState = {
        ...inputState,
        isValid: !!isValid,
        errors: formStateRef.errors,
        name,
      };

      formStateRef = {
        ...formStateRef,
        ...updatedFormState,
      };

      subjectsRef.state.next(isWatched ? { name } : updatedFormState);
    }

    subjectsRef.state.next({
      isValidating: false,
    });
  };

  const setFieldValue = (
    name: InternalFieldName,
    rawValue: SetFieldValue<TFieldValues>,
    options: SetValueConfig = {},
    shouldRender?: boolean,
    shouldRegister?: boolean,
  ) => {
    shouldRegister && register(name as Path<TFieldValues>);
    const field = get(fieldsRef, name);

    if (field) {
      const _f = (field as Field)._f;

      if (_f) {
        const value =
          isWeb && isHTMLElement(_f.ref) && isNullOrUndefined(rawValue)
            ? ''
            : rawValue;
        _f.value = getFieldValueAs(rawValue, _f);

        if (isRadioInput(_f.ref)) {
          (_f.refs || []).forEach(
            (radioRef: HTMLInputElement) =>
              (radioRef.checked = radioRef.value === value),
          );
        } else if (isFileInput(_f.ref) && !isString(value)) {
          _f.ref.files = value as FileList;
        } else if (isMultipleSelect(_f.ref)) {
          [..._f.ref.options].forEach(
            (selectRef) =>
              (selectRef.selected = (value as string[]).includes(
                selectRef.value,
              )),
          );
        } else if (isCheckBoxInput(_f.ref) && _f.refs) {
          _f.refs.length > 1
            ? _f.refs.forEach(
                (checkboxRef) =>
                  (checkboxRef.checked = Array.isArray(value)
                    ? !!(value as []).find(
                        (data: string) => data === checkboxRef.value,
                      )
                    : value === checkboxRef.value),
              )
            : (_f.refs[0].checked = !!value);
        } else {
          _f.ref.value = value;
        }

        if (shouldRender) {
          const values = getFieldsValues(fieldsRef);
          set(values, name, rawValue);
          subjectsRef.control.next({
            values: {
              ...defaultValues,
              ...values,
            } as DefaultValues<TFieldValues>,
            name,
          });
        }

        (options.shouldDirty || options.shouldTouch) &&
          updateTouchAndDirtyState(name, value, options.shouldTouch);
        options.shouldValidate && trigger(name as Path<TFieldValues>);
      } else {
        field._f = {
          ref: {
            name,
            value: rawValue,
          },
          value: rawValue,
        };
      }
    }
  };

  const getIsDirty: GetIsDirty = (name, data) => {
    const formValues = getFieldsValues(fieldsRef);

    name && data && set(formValues, name, data);

    return !deepEqual(formValues, defaultValues);
  };

  const updateTouchAndDirtyState = (
    name: InternalFieldName,
    inputValue: unknown,
    isCurrentTouched?: boolean,
    shouldRender = true,
  ): Partial<
    Pick<FormState<TFieldValues>, 'dirtyFields' | 'isDirty' | 'touchedFields'>
  > => {
    const state: Partial<FormState<TFieldValues>> & { name: string } = {
      name,
    };
    let isChanged = false;

    if (readFormStateRef.isDirty) {
      const previousIsDirty = formStateRef.isDirty;
      formStateRef.isDirty = getIsDirty();
      state.isDirty = formStateRef.isDirty;
      isChanged = previousIsDirty !== state.isDirty;
    }

    if (readFormStateRef.dirtyFields && !isCurrentTouched) {
      const isPreviousFieldDirty = get(formStateRef.dirtyFields, name);
      const isCurrentFieldDirty = !deepEqual(
        get(defaultValues, name),
        inputValue,
      );
      isCurrentFieldDirty
        ? set(formStateRef.dirtyFields, name, true)
        : unset(formStateRef.dirtyFields, name);
      state.dirtyFields = formStateRef.dirtyFields;
      isChanged =
        isChanged ||
        isPreviousFieldDirty !== get(formStateRef.dirtyFields, name);
    }

    const isPreviousFieldTouched = get(formStateRef.touchedFields, name);

    if (isCurrentTouched && !isPreviousFieldTouched) {
      set(formStateRef.touchedFields, name, isCurrentTouched);
      state.touchedFields = formStateRef.touchedFields;
      isChanged =
        isChanged ||
        (readFormStateRef.touchedFields &&
          isPreviousFieldTouched !== isCurrentTouched);
    }

    isChanged && shouldRender && subjectsRef.state.next(state);

    return isChanged ? state : {};
  };

  const executeInlineValidation = async (
    name: InternalFieldName,
    skipReRender: boolean,
  ): Promise<boolean> => {
    const error = (
      await validateField(
        get(fieldsRef, name) as Field,
        isValidateAllFieldCriteria,
        formOptions.shouldUseNativeValidation,
      )
    )[name];

    shouldRenderBaseOnError(skipReRender, name, error);

    return isUndefined(error);
  };

  const executeResolverValidation = async (names?: InternalFieldName[]) => {
    const { errors } = await formOptions.resolver!(
      getFieldsValues(fieldsRef),
      formOptions.context,
      getResolverOptions(
        namesRef.mount,
        fieldsRef,
        formOptions.criteriaMode,
        formOptions.shouldUseNativeValidation,
      ),
    );

    if (names) {
      for (const name of names) {
        const error = get(errors, name);
        error
          ? set(formStateRef.errors, name, error)
          : unset(formStateRef.errors, name);
      }
    } else {
      formStateRef.errors = errors;
    }

    return errors;
  };

  const validateForm = async (
    fieldsRef: FieldRefs,
    shouldCheckValid?: boolean,
    context = {
      valid: true,
    },
  ) => {
    for (const name in fieldsRef) {
      const field = fieldsRef[name];

      if (field) {
        const _f = field._f;
        const current = omit(field, '_f');

        if (_f) {
          const fieldError = await validateField(
            field,
            isValidateAllFieldCriteria,
            formOptions.shouldUseNativeValidation,
          );

          if (shouldCheckValid) {
            if (fieldError[_f.name]) {
              context.valid = false;
              break;
            }
          } else {
            fieldError[_f.name]
              ? set(formStateRef.errors, _f.name, fieldError[_f.name])
              : unset(formStateRef.errors, _f.name);
          }
        }

        current && (await validateForm(current, shouldCheckValid, context));
      }
    }

    return context.valid;
  };

  const trigger: UseFormTrigger<TFieldValues> = async (name, options = {}) => {
    const fieldNames = convertToArrayPayload(name) as InternalFieldName[];
    let isValid;

    subjectsRef.state.next({
      isValidating: true,
    });

    if (formOptions.resolver) {
      const schemaResult = await executeResolverValidation(
        isUndefined(name) ? name : fieldNames,
      );
      isValid = name
        ? fieldNames.every((name) => !get(schemaResult, name))
        : isEmptyObject(schemaResult);
    } else {
      if (name) {
        isValid = (
          await Promise.all(
            fieldNames
              .filter((fieldName) => get(fieldsRef, fieldName, {})._f)
              .map(
                async (fieldName) =>
                  await executeInlineValidation(fieldName, true),
              ),
          )
        ).every(Boolean);
      } else {
        await validateForm(fieldsRef);
        isValid = isEmptyObject(formStateRef.errors);
      }
    }

    subjectsRef.state.next({
      ...(isString(name) ? { name } : {}),
      errors: formStateRef.errors,
      isValidating: false,
    });

    if (options.shouldFocus && !isValid) {
      focusFieldBy(
        fieldsRef,
        (key) => get(formStateRef.errors, key),
        fieldNames,
      );
    }

    readFormStateRef.isValid && updateIsValid();

    return isValid;
  };

  const updateIsValidAndInputValue = (name: InternalFieldName, ref?: Ref) => {
    const field = get(fieldsRef, name) as Field;

    if (field) {
      const isValueUndefined = isUndefined(field._f.value);
      const defaultValue = isValueUndefined
        ? get(defaultValues, name)
        : field._f.value;

      if (!isUndefined(defaultValue)) {
        if (ref && (ref as HTMLInputElement).defaultChecked) {
          field._f.value = getFieldValue(field);
        } else if (isNameInFieldArray(namesRef.array, name)) {
          field._f.value = defaultValue;
        } else {
          setFieldValue(name, defaultValue);
        }
      } else if (isValueUndefined) {
        field._f.value = getFieldValue(field);
      }
    }

    isMountedRef && readFormStateRef.isValid && updateIsValid();
  };

  const updateIsValid = async (values = {}) => {
    const isValid = formOptions.resolver
      ? isEmptyObject(
          (
            await formOptions.resolver!(
              {
                ...getFieldsValues(fieldsRef),
                ...values,
              },
              formOptions.context,
              getResolverOptions(
                namesRef.mount,
                fieldsRef,
                formOptions.criteriaMode,
                formOptions.shouldUseNativeValidation,
              ),
            )
          ).errors,
        )
      : await validateForm(fieldsRef, true);

    isValid !== formStateRef.isValid &&
      subjectsRef.state.next({
        isValid,
      });
  };

  const setInternalValues = (
    name: FieldPath<TFieldValues>,
    value: UnpackNestedValue<PathValue<TFieldValues, FieldPath<TFieldValues>>>,
    options: SetValueConfig,
  ) =>
    Object.entries(value).forEach(([inputKey, inputValue]) => {
      const fieldName = `${name}.${inputKey}` as Path<TFieldValues>;
      const field = get(fieldsRef, fieldName);
      const isFieldArray = namesRef.array.has(name);

      isFieldArray || !isPrimitive(inputValue) || (field && !field._f)
        ? setInternalValues(
            fieldName,
            inputValue as SetFieldValue<TFieldValues>,
            options,
          )
        : setFieldValue(
            fieldName,
            inputValue as SetFieldValue<TFieldValues>,
            options,
            true,
            !field,
          );
    });

  const setValue: UseFormSetValue<TFieldValues> = (
    name,
    value,
    options = {},
  ) => {
    const field = get(fieldsRef, name);
    const isFieldArray = namesRef.array.has(name);

    if (isFieldArray) {
      subjectsRef.array.next({
        values: value,
        name,
        isReset: true,
      });

      if (
        (readFormStateRef.isDirty || readFormStateRef.dirtyFields) &&
        options.shouldDirty
      ) {
        set(
          formStateRef.dirtyFields,
          name,
          setFieldArrayDirtyFields(
            value,
            get(defaultValues, name, []),
            get(formStateRef.dirtyFields, name, []),
          ),
        );

        subjectsRef.state.next({
          name,
          dirtyFields: formStateRef.dirtyFields,
          isDirty: getIsDirty(name, value),
        });
      }

      !(value as []).length &&
        set(fieldsRef, name, []) &&
        set(fieldArrayDefaultValuesRef, name, []);
    }

    ((field && !field._f) || isFieldArray) && !isNullOrUndefined(value)
      ? setInternalValues(name, value, isFieldArray ? {} : options)
      : setFieldValue(name, value, options, true, !field);

    isFieldWatched(name) && subjectsRef.state.next({});
    subjectsRef.watch.next({ name, values: getValues() });
  };

  const handleChange: ChangeHandler = async ({
    type,
    target,
    target: { value, type: inputType },
  }) => {
    let name = (target as Ref)!.name;
    let error;
    let isValid;
    const field = get(fieldsRef, name) as Field;

    if (field) {
      let inputValue = inputType ? getFieldValue(field) : undefined;
      inputValue = isUndefined(inputValue) ? value : inputValue;

      const isBlurEvent = type === EVENTS.BLUR;
      const { isOnBlur: isReValidateOnBlur, isOnChange: isReValidateOnChange } =
        getValidationModes(formOptions.reValidateMode);

      const shouldSkipValidation =
        (!hasValidation(field._f, field._f.mount) &&
          !formOptions.resolver &&
          !get(formStateRef.errors, name)) ||
        skipValidation({
          isBlurEvent,
          isTouched: !!get(formStateRef.touchedFields, name),
          isSubmitted: formStateRef.isSubmitted,
          isReValidateOnBlur,
          isReValidateOnChange,
          ...validationMode,
        });
      const isWatched =
        !isBlurEvent && isFieldWatched(name as FieldPath<TFieldValues>);

      if (!isUndefined(inputValue)) {
        field._f.value = inputValue;
      }

      const inputState = updateTouchAndDirtyState(
        name,
        field._f.value,
        isBlurEvent,
        false,
      );

      const shouldRender = !isEmptyObject(inputState) || isWatched;

      if (shouldSkipValidation) {
        !isBlurEvent &&
          subjectsRef.watch.next({
            name,
            type,
            values: getValues(),
          });
        return (
          shouldRender &&
          subjectsRef.state.next(isWatched ? { name } : { ...inputState, name })
        );
      }

      subjectsRef.state.next({
        isValidating: true,
      });

      if (formOptions.resolver) {
        const { errors } = await formOptions.resolver!(
          getFieldsValues(fieldsRef),
          formOptions.context,
          getResolverOptions(
            [name],
            fieldsRef,
            formOptions.criteriaMode,
            formOptions.shouldUseNativeValidation,
          ),
        );
        error = get(errors, name);

        if (isCheckBoxInput(target as Ref) && !error) {
          const parentNodeName = getNodeParentName(name);
          const currentError = get(errors, parentNodeName, {});
          currentError.type && currentError.message && (error = currentError);

          if (currentError || get(formStateRef.errors, parentNodeName)) {
            name = parentNodeName;
          }
        }

        isValid = isEmptyObject(errors);
      } else {
        error = (
          await validateField(
            field,
            isValidateAllFieldCriteria,
            formOptions.shouldUseNativeValidation,
          )
        )[name];
      }

      !isBlurEvent &&
        subjectsRef.watch.next({
          name,
          type,
          values: getValues(),
        });
      shouldRenderBaseOnError(
        false,
        name,
        error,
        inputState,
        isValid,
        isWatched,
      );
    }
  };

  const getValues: UseFormGetValues<TFieldValues> = (
    fieldNames?:
      | FieldPath<TFieldValues>
      | ReadonlyArray<FieldPath<TFieldValues>>,
  ) => {
    const values = {
      ...defaultValues,
      ...getFieldsValues(fieldsRef),
    };

    return isUndefined(fieldNames)
      ? values
      : isString(fieldNames)
      ? get(values, fieldNames as InternalFieldName)
      : fieldNames.map((name) => get(values, name as InternalFieldName));
  };

  const clearErrors: UseFormClearErrors<TFieldValues> = (name) => {
    name
      ? convertToArrayPayload(name).forEach((inputName) =>
          unset(formStateRef.errors, inputName),
        )
      : (formStateRef.errors = {});

    subjectsRef.state.next({
      errors: formStateRef.errors,
    });
  };

  const setError: UseFormSetError<TFieldValues> = (name, error, options) => {
    const ref = (((get(fieldsRef, name) as Field) || { _f: {} })._f || {}).ref;

    set(formStateRef.errors, name, {
      ...error,
      ref,
    });

    subjectsRef.state.next({
      name,
      errors: formStateRef.errors,
      isValid: false,
    });

    options && options.shouldFocus && ref && ref.focus && ref.focus();
  };

  const watchInternal: WatchInternal<TFieldValues> = (
    fieldNames,
    defaultValue,
    isGlobal,
    formValues,
  ) => {
    const isArrayNames = Array.isArray(fieldNames);
    const fieldValues =
      formValues || isMountedRef
        ? {
            ...defaultValues,
            ...(formValues || getFieldsValues(fieldsRef)),
          }
        : isUndefined(defaultValue)
        ? defaultValues
        : isArrayNames
        ? defaultValue
        : { [fieldNames as InternalFieldName]: defaultValue };

    if (isUndefined(fieldNames)) {
      isGlobal && (namesRef.watchAll = true);
      return fieldValues;
    }

    const result = [];

    for (const fieldName of convertToArrayPayload(fieldNames)) {
      isGlobal && namesRef.watch.add(fieldName as InternalFieldName);
      result.push(get(fieldValues, fieldName as InternalFieldName));
    }

    return isArrayNames ? result : result[0];
  };

  const watch: UseFormWatch<TFieldValues> = (
    fieldName?:
      | FieldPath<TFieldValues>
      | ReadonlyArray<FieldPath<TFieldValues>>
      | WatchObserver<TFieldValues>,
    defaultValue?: unknown,
  ) =>
    isFunction(fieldName)
      ? subjectsRef.watch.subscribe({
          next: (info) =>
            fieldName(
              watchInternal(
                undefined,
                defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>,
              ) as UnpackNestedValue<TFieldValues>,
              info,
            ),
        })
      : watchInternal(
          fieldName as InternalFieldName | InternalFieldName[],
          defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>,
          true,
        );

  const unregister: UseFormUnregister<TFieldValues> = (name, options = {}) => {
    for (const inputName of name
      ? convertToArrayPayload(name)
      : namesRef.mount) {
      namesRef.mount.delete(inputName);
      namesRef.array.delete(inputName);

      if (get(fieldsRef, inputName) as Field) {
        !options.keepError && unset(formStateRef.errors, inputName);
        !options.keepValue && unset(fieldsRef, inputName);
        !options.keepDirty && unset(formStateRef.dirtyFields, inputName);
        !options.keepTouched && unset(formStateRef.touchedFields, inputName);
        !options.keepDefaultValue && unset(defaultValues, inputName);

        subjectsRef.watch.next({
          name: inputName,
          values: getValues(),
        });
      }
    }

    subjectsRef.state.next({
      ...formStateRef,
      ...(!options.keepDirty ? {} : { isDirty: getIsDirty() }),
    });
    !options.keepIsValid && updateIsValid();
  };

  const registerFieldRef = (
    name: InternalFieldName,
    ref: HTMLInputElement,
    options?: RegisterOptions,
  ): ((name: InternalFieldName) => void) | void => {
    register(name as FieldPath<TFieldValues>, options);
    let field = get(fieldsRef, name) as Field;

    const isRadioOrCheckbox = isRadioOrCheckboxFunction(ref);

    if (
      ref === field._f.ref ||
      (isRadioOrCheckbox &&
        compact(field._f.refs || []).find((option) => option === ref))
    ) {
      return;
    }

    field = {
      _f: isRadioOrCheckbox
        ? {
            ...field._f,
            refs: [
              ...compact(field._f.refs || []).filter(
                (ref) => isHTMLElement(ref) && document.contains(ref),
              ),
              ref,
            ],
            ref: { type: ref.type, name },
          }
        : {
            ...field._f,
            ref,
          },
    };

    set(fieldsRef, name, field);

    updateIsValidAndInputValue(name, ref);
  };

  const register: UseFormRegister<TFieldValues> = (name, options = {}) => {
    const field = get(fieldsRef, name);

    set(fieldsRef, name, {
      _f: {
        ...(field && field._f ? field._f : { ref: { name } }),
        name,
        mount: true,
        ...options,
      },
    });
    namesRef.mount.add(name);
    !field && updateIsValidAndInputValue(name);

    return isWindowUndefined
      ? ({ name: name as InternalFieldName } as UseFormRegisterReturn)
      : {
          name,
          onChange: handleChange,
          onBlur: handleChange,
          ref: (ref: HTMLInputElement | null): void => {
            if (ref) {
              registerFieldRef(name, ref, options);
            } else {
              const field = get(fieldsRef, name, {}) as Field;
              const shouldUnmount =
                formOptions.shouldUnregister || options.shouldUnregister;

              if (field._f) {
                field._f.mount = false;
                // If initial state of field element is disabled,
                // value is not set on first "register"
                // re-sync the value in when it switched to enabled
                if (isUndefined(field._f.value)) {
                  field._f.value = field._f.ref.value;
                }
              }

              shouldUnmount &&
                !(
                  isNameInFieldArray(namesRef.array, name) &&
                  inFieldArrayActionRef
                ) &&
                namesRef.unMount.add(name);
            }
          },
        };
  };

  const handleSubmit: UseFormHandleSubmit<TFieldValues> =
    (onValid, onInvalid) => async (e) => {
      if (e) {
        e.preventDefault && e.preventDefault();
        e.persist && e.persist();
      }
      let hasNoPromiseError = true;
      let fieldValues = getFieldsValues(fieldsRef);

      subjectsRef.state.next({
        isSubmitting: true,
      });

      try {
        if (formOptions.resolver) {
          const { errors, values } = await formOptions.resolver!(
            fieldValues,
            formOptions.context,
            getResolverOptions(
              namesRef.mount,
              fieldsRef,
              formOptions.criteriaMode,
              formOptions.shouldUseNativeValidation,
            ),
          );
          formStateRef.errors = errors;
          fieldValues = values;
        } else {
          await validateForm(fieldsRef);
        }

        if (
          isEmptyObject(formStateRef.errors) &&
          Object.keys(formStateRef.errors).every((name) =>
            get(fieldValues, name),
          )
        ) {
          subjectsRef.state.next({
            errors: {},
            isSubmitting: true,
          });
          await onValid(fieldValues, e);
        } else {
          onInvalid && (await onInvalid(formStateRef.errors, e));
          formOptions.shouldFocusError &&
            focusFieldBy(
              fieldsRef,
              (key) => get(formStateRef.errors, key),
              namesRef.mount,
            );
        }
      } catch (err) {
        hasNoPromiseError = false;
        throw err;
      } finally {
        formStateRef.isSubmitted = true;
        subjectsRef.state.next({
          isSubmitted: true,
          isSubmitting: false,
          isSubmitSuccessful:
            isEmptyObject(formStateRef.errors) && hasNoPromiseError,
          submitCount: formStateRef.submitCount + 1,
          errors: formStateRef.errors,
        });
      }
    };

  const registerAbsentFields = <T extends DefaultValues<TFieldValues>>(
    defaultValues: T,
    name = '',
  ): void => {
    for (const key in defaultValues) {
      const value = defaultValues[key];
      const fieldName = name + (name ? '.' : '') + key;
      const field = get(fieldsRef, fieldName);

      if (!field || !field._f) {
        if (isObject(value) || Array.isArray(value)) {
          registerAbsentFields(value, fieldName);
        } else if (!field) {
          register(fieldName as Path<TFieldValues>, { value });
        }
      }
    }
  };

  const reset: UseFormReset<TFieldValues> = (values, keepStateOptions = {}) => {
    const updatedValues = values || defaultValues;

    if (isWeb && !keepStateOptions.keepValues) {
      for (const name of namesRef.mount) {
        const field = get(fieldsRef, name);
        if (field && field._f) {
          const inputRef = Array.isArray(field._f.refs)
            ? field._f.refs[0]
            : field._f.ref;

          try {
            isHTMLElement(inputRef) && inputRef.closest('form')!.reset();
            break;
          } catch {}
        }
      }
    }

    !keepStateOptions.keepDefaultValues &&
      (defaultValues = { ...updatedValues } as const);

    if (!keepStateOptions.keepValues) {
      fieldsRef = {};

      subjectsRef.control.next({
        values: { ...updatedValues },
      });

      subjectsRef.watch.next({
        values: { ...updatedValues },
      });

      subjectsRef.array.next({
        values: { ...updatedValues },
        isReset: true,
      });
    }

    namesRef = {
      mount: new Set(),
      unMount: new Set(),
      array: new Set(),
      watch: new Set(),
      watchAll: false,
    };

    subjectsRef.state.next({
      submitCount: keepStateOptions.keepSubmitCount
        ? formStateRef.submitCount
        : 0,
      isDirty: keepStateOptions.keepDirty
        ? formStateRef.isDirty
        : keepStateOptions.keepDefaultValues
        ? deepEqual(values, defaultValues)
        : false,
      isSubmitted: keepStateOptions.keepIsSubmitted
        ? formStateRef.isSubmitted
        : false,
      dirtyFields: keepStateOptions.keepDirty ? formStateRef.dirtyFields : {},
      touchedFields: keepStateOptions.keepTouched
        ? formStateRef.touchedFields
        : {},
      errors: keepStateOptions.keepErrors ? formStateRef.errors : {},
      isSubmitting: false,
      isSubmitSuccessful: false,
    });

    isMountedRef = !!keepStateOptions.keepIsValid;
  };

  const setFocus: UseFormSetFocus<TFieldValues> = (name) =>
    get(fieldsRef, name)._f.ref.focus();

  const readFormStateRefControl = {
    get current() {
      return readFormStateRef;
    },
  };

  const formControl = {
    control: {
      register,
      inFieldArrayActionRef: {
        get current() {
          return inFieldArrayActionRef;
        },
        set current(v) {
          inFieldArrayActionRef = v;
        },
      },
      getIsDirty,
      subjectsRef: {
        get current() {
          return subjectsRef;
        },
        set current(v) {
          subjectsRef = v;
        },
      },
      watchInternal,
      fieldsRef: {
        get current() {
          return fieldsRef;
        },
        set current(v) {
          fieldsRef = v;
        },
      },
      updateIsValid,
      namesRef: {
        get current() {
          return namesRef;
        },
        set current(v) {
          namesRef = v;
        },
      },
      readFormStateRef: readFormStateRefControl,
      formStateRef: {
        get current() {
          return formStateRef;
        },
        set current(v) {
          formStateRef = v;
          formControl.formState = getProxyFormState<TFieldValues>(
            isProxyEnabled,
            formStateRef,
            readFormStateRefControl,
          );
        },
      },
      defaultValuesRef: {
        get current() {
          return defaultValues;
        },
        set current(v) {
          defaultValues = v;
        },
      },
      fieldArrayDefaultValuesRef: {
        get current() {
          return fieldArrayDefaultValuesRef;
        },
        set current(v) {
          fieldArrayDefaultValuesRef = v;
        },
      },
      unregister,
      shouldUnmount: formOptions.shouldUnregister,
      registerAbsentFields,
      isMountedRef: {
        get current() {
          return isMountedRef;
        },
        set current(v) {
          isMountedRef = v;
        },
      },
    },
    formState: getProxyFormState<TFieldValues>(
      isProxyEnabled,
      formStateRef,
      readFormStateRefControl,
    ),
    trigger,
    register,
    handleSubmit,
    setOptions: (options: UseFormProps<TFieldValues, TContext>) => {
      formOptions = { ...defaultOptions, ...options };
    },
    watch: watch,
    setValue: setValue,
    getValues: getValues,
    reset: reset,
    clearErrors: clearErrors,
    unregister: unregister,
    setError: setError,
    setFocus: setFocus,
  };

  return formControl;
}

export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
>(options: UseFormProps<TFieldValues, TContext> = {}) {
  const [, forceUpdate] = useState({});

  const formControlRef = useRef<UseFormReturn<TFieldValues> | undefined>();

  if (!formControlRef.current) {
    formControlRef.current = createForm(options);
  } else {
    formControlRef.current.setOptions(options);
  }

  const control = formControlRef.current!.control;

  useEffect(() => {
    const formStateSubscription = control.subjectsRef.current.state.subscribe({
      next(formState) {
        if (
          shouldRenderFormState(
            formState,
            control.readFormStateRef.current,
            true,
          )
        ) {
          control.formStateRef.current = {
            ...control.formStateRef.current,
            ...formState,
          };
          forceUpdate({});
        }
      },
    });

    const useFieldArraySubscription =
      control.subjectsRef.current.array.subscribe({
        next(state) {
          if (
            state.values &&
            state.name &&
            control.readFormStateRef.current.isValid
          ) {
            const values = getFieldsValues(control.fieldsRef.current);
            set(values, state.name, state.values);
            control.updateIsValid(values);
          }
        },
      });

    return () => {
      formStateSubscription.unsubscribe();
      useFieldArraySubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const isLiveInDom = (ref: Ref) =>
      !isHTMLElement(ref) || !document.contains(ref);

    if (!control.isMountedRef.current) {
      control.isMountedRef.current = true;
      control.readFormStateRef.current.isValid && control.updateIsValid();
      !control.shouldUnmount &&
        control.registerAbsentFields(control.defaultValuesRef.current);
    }

    for (const name of control.namesRef.current.unMount) {
      const field = get(control.fieldsRef.current, name) as Field;

      field &&
        (field._f.refs
          ? field._f.refs.every(isLiveInDom)
          : isLiveInDom(field._f.ref)) &&
        control.unregister(name as FieldPath<TFieldValues>);
    }

    control.namesRef.current.unMount = new Set();
  });

  return formControlRef.current!;
}
