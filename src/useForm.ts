import * as React from 'react';

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
  KeepStateOptions,
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

export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
>({
  mode = VALIDATION_MODE.onSubmit,
  reValidateMode = VALIDATION_MODE.onChange,
  resolver,
  context,
  defaultValues = {} as DefaultValues<TFieldValues>,
  shouldFocusError = true,
  shouldUnregister,
  criteriaMode,
}: UseFormProps<TFieldValues, TContext> = {}): UseFormReturn<TFieldValues> {
  const [formState, updateFormState] = React.useState<FormState<TFieldValues>>({
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
  });
  const readFormStateRef = React.useRef<ReadFormState>({
    isDirty: !isProxyEnabled,
    dirtyFields: !isProxyEnabled,
    touchedFields: !isProxyEnabled,
    isValidating: !isProxyEnabled,
    isValid: !isProxyEnabled,
    errors: !isProxyEnabled,
  });
  const formStateRef = React.useRef(formState);
  const fieldsRef = React.useRef<FieldRefs>({});
  const defaultValuesRef =
    React.useRef<DefaultValues<TFieldValues>>(defaultValues);
  const fieldArrayDefaultValuesRef = React.useRef<FieldArrayDefaultValues>({});
  const contextRef = React.useRef(context);
  const inFieldArrayActionRef = React.useRef(false);
  const isMountedRef = React.useRef(false);
  const subjectsRef: Subjects<TFieldValues> = React.useRef({
    watch: new Subject(),
    control: new Subject(),
    array: new Subject(),
    state: new Subject(),
  });
  const namesRef = React.useRef<Names>({
    mount: new Set(),
    unMount: new Set(),
    array: new Set(),
    watch: new Set(),
    watchAll: false,
  });

  const validationMode = getValidationModes(mode);
  const isValidateAllFieldCriteria = criteriaMode === VALIDATION_MODE.all;
  contextRef.current = context;

  const isFieldWatched = (name: FieldPath<TFieldValues>) =>
    namesRef.current.watchAll ||
    namesRef.current.watch.has(name) ||
    namesRef.current.watch.has((name.match(/\w+/) || [])[0]);

  const shouldRenderBaseOnError = React.useCallback(
    async (
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
      const previousError = get(formStateRef.current.errors, name);
      const isValid = readFormStateRef.current.isValid
        ? resolver
          ? isValidFromResolver
          : await validateForm(fieldsRef.current, true)
        : false;

      error
        ? set(formStateRef.current.errors, name, error)
        : unset(formStateRef.current.errors, name);

      if (
        (isWatched ||
          (error ? !deepEqual(previousError, error, true) : previousError) ||
          !isEmptyObject(inputState) ||
          formStateRef.current.isValid !== isValid) &&
        !shouldSkipRender
      ) {
        const updatedFormState = {
          ...inputState,
          isValid: !!isValid,
          errors: formStateRef.current.errors,
          name,
        };

        formStateRef.current = {
          ...formStateRef.current,
          ...updatedFormState,
        };

        subjectsRef.current.state.next(isWatched ? { name } : updatedFormState);
      }

      subjectsRef.current.state.next({
        isValidating: false,
      });
    },
    [],
  );

  const setFieldValue = React.useCallback(
    (
      name: InternalFieldName,
      rawValue: SetFieldValue<TFieldValues>,
      options: SetValueConfig = {},
      shouldRender?: boolean,
      shouldRegister?: boolean,
    ) => {
      shouldRegister && register(name as Path<TFieldValues>);
      const field = get(fieldsRef.current, name);

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
            subjectsRef.current.control.next({
              values: {
                ...defaultValuesRef.current,
                ...values,
              } as DefaultValues<TFieldValues>,
              name,
            });
          }

          options.shouldDirty && updateAndGetDirtyState(name, value);
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
    },
    [],
  );

  const getIsDirty: GetIsDirty = React.useCallback((name, data) => {
    const formValues = getFieldsValues(fieldsRef);

    name && data && set(formValues, name, data);

    return !deepEqual(formValues, defaultValuesRef.current);
  }, []);

  const updateAndGetDirtyState = React.useCallback(
    (
      name: InternalFieldName,
      inputValue: unknown,
      shouldRender = true,
    ): Partial<
      Pick<FormState<TFieldValues>, 'dirtyFields' | 'isDirty' | 'touchedFields'>
    > => {
      if (
        readFormStateRef.current.isDirty ||
        readFormStateRef.current.dirtyFields
      ) {
        const isFieldDirty = !deepEqual(
          get(defaultValuesRef.current, name),
          inputValue,
        );
        const isDirtyFieldExist = get(formStateRef.current.dirtyFields, name);
        const previousIsDirty = formStateRef.current.isDirty;

        isFieldDirty
          ? set(formStateRef.current.dirtyFields, name, true)
          : unset(formStateRef.current.dirtyFields, name);

        formStateRef.current.isDirty = getIsDirty();

        const state = {
          isDirty: formStateRef.current.isDirty,
          dirtyFields: formStateRef.current.dirtyFields,
          name,
        };

        const isChanged =
          (readFormStateRef.current.isDirty &&
            previousIsDirty !== state.isDirty) ||
          (readFormStateRef.current.dirtyFields &&
            isDirtyFieldExist !== get(formStateRef.current.dirtyFields, name));

        isChanged && shouldRender && subjectsRef.current.state.next(state);

        return isChanged ? state : {};
      }

      return {};
    },
    [],
  );

  const executeInlineValidation = React.useCallback(
    async (
      name: InternalFieldName,
      skipReRender: boolean,
    ): Promise<boolean> => {
      const error = (
        await validateField(
          get(fieldsRef.current, name) as Field,
          isValidateAllFieldCriteria,
        )
      )[name];

      shouldRenderBaseOnError(skipReRender, name, error);

      return isUndefined(error);
    },
    [isValidateAllFieldCriteria],
  );

  const executeResolverValidation = React.useCallback(
    async (names?: InternalFieldName[]) => {
      const { errors } = await resolver!(
        getFieldsValues(fieldsRef),
        contextRef.current,
        getResolverOptions(
          namesRef.current.mount,
          fieldsRef.current,
          criteriaMode,
        ),
      );

      if (names) {
        for (const name of names) {
          const error = get(errors, name);
          error
            ? set(formStateRef.current.errors, name, error)
            : unset(formStateRef.current.errors, name);
        }
      } else {
        formStateRef.current.errors = errors;
      }

      return errors;
    },
    [criteriaMode],
  );

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
          );

          if (shouldCheckValid) {
            if (fieldError[_f.name]) {
              context.valid = false;
              break;
            }
          } else {
            fieldError[_f.name]
              ? set(formStateRef.current.errors, _f.name, fieldError[_f.name])
              : unset(formStateRef.current.errors, _f.name);
          }
        }

        current && (await validateForm(current, shouldCheckValid, context));
      }
    }

    return context.valid;
  };

  const trigger: UseFormTrigger<TFieldValues> = React.useCallback(
    async (name, options = {}) => {
      const fieldNames = convertToArrayPayload(name) as InternalFieldName[];
      let isValid;

      subjectsRef.current.state.next({
        isValidating: true,
      });

      if (resolver) {
        const schemaResult = await executeResolverValidation(
          isUndefined(name) ? name : fieldNames,
        );
        isValid = name
          ? fieldNames.every((name) => !get(schemaResult, name))
          : isEmptyObject(schemaResult);
      } else {
        isValid = name
          ? (
              await Promise.all(
                fieldNames
                  .filter((fieldName) => get(fieldsRef.current, fieldName))
                  .map(
                    async (fieldName) =>
                      await executeInlineValidation(fieldName, true),
                  ),
              )
            ).every(Boolean)
          : await validateForm(fieldsRef.current);
      }

      subjectsRef.current.state.next({
        ...(isString(name) ? { name } : {}),
        errors: formStateRef.current.errors,
        isValidating: false,
      });

      if (options.shouldFocus && !isValid) {
        focusFieldBy(
          fieldsRef.current,
          (key) => get(formStateRef.current.errors, key),
          fieldNames,
        );
      }

      readFormStateRef.current.isValid && updateIsValid();

      return isValid;
    },
    [executeResolverValidation, executeInlineValidation],
  );

  const updateValidAndValue = (name: InternalFieldName, ref?: Ref) => {
    const field = get(fieldsRef.current, name) as Field;
    const defaultValue = isUndefined(field._f.value)
      ? get(defaultValuesRef.current, name)
      : field._f.value;

    if (field && !isUndefined(defaultValue)) {
      if (ref && (ref as HTMLInputElement).defaultChecked) {
        field._f.value = getFieldValue(field);
      } else if (!isNameInFieldArray(namesRef.current.array, name)) {
        setFieldValue(name, defaultValue);
      } else {
        field._f.value = defaultValue;
      }
    } else {
      field._f.value = getFieldValue(field);
    }

    isMountedRef.current && readFormStateRef.current.isValid && updateIsValid();

    return defaultValue;
  };

  const updateIsValid = React.useCallback(
    async (values = {}) => {
      const isValid = resolver
        ? isEmptyObject(
            (
              await resolver(
                {
                  ...getFieldsValues(fieldsRef),
                  ...values,
                },
                contextRef.current,
                getResolverOptions(
                  namesRef.current.mount,
                  fieldsRef.current,
                  criteriaMode,
                ),
              )
            ).errors,
          )
        : await validateForm(fieldsRef.current, true);

      isValid !== formStateRef.current.isValid &&
        subjectsRef.current.state.next({
          isValid,
        });
    },
    [criteriaMode],
  );

  const setInternalValues = React.useCallback(
    (
      name: FieldPath<TFieldValues>,
      value: UnpackNestedValue<
        PathValue<TFieldValues, FieldPath<TFieldValues>>
      >,
      options: SetValueConfig,
    ) =>
      Object.entries(value).forEach(([inputKey, inputValue]) => {
        const fieldName = `${name}.${inputKey}` as Path<TFieldValues>;
        const field = get(fieldsRef.current, fieldName);
        const isFieldArray = namesRef.current.array.has(name);

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
      }),
    [trigger],
  );

  const setValue: UseFormSetValue<TFieldValues> = (
    name,
    value,
    options = {},
  ) => {
    const field = get(fieldsRef.current, name);
    const isFieldArray = namesRef.current.array.has(name);

    if (isFieldArray) {
      subjectsRef.current.array.next({
        values: value,
        name,
        isReset: true,
      });

      if (
        (readFormStateRef.current.isDirty ||
          readFormStateRef.current.dirtyFields) &&
        options.shouldDirty
      ) {
        set(
          formStateRef.current.dirtyFields,
          name,
          setFieldArrayDirtyFields(
            value,
            get(defaultValuesRef.current, name, []),
            get(formStateRef.current.dirtyFields, name, []),
          ),
        );

        subjectsRef.current.state.next({
          name,
          dirtyFields: formStateRef.current.dirtyFields,
          isDirty: getIsDirty(name, value),
        });
      }

      !(value as []).length &&
        set(fieldsRef.current, name, []) &&
        set(fieldArrayDefaultValuesRef.current, name, []);
    }

    ((field && !field._f) || isFieldArray) && !isNullOrUndefined(value)
      ? setInternalValues(name, value, isFieldArray ? {} : options)
      : setFieldValue(name, value, options, true, !field);

    isFieldWatched(name) && subjectsRef.current.state.next({});
    subjectsRef.current.watch.next({ name, values: getValues() });
  };

  const handleChange: ChangeHandler = React.useCallback(
    async ({ type, target, target: { value, type: inputType } }) => {
      let name = (target as Ref)!.name;
      let error;
      let isValid;
      const field = get(fieldsRef.current, name) as Field;

      if (field) {
        let inputValue = inputType ? getFieldValue(field) : undefined;
        inputValue = isUndefined(inputValue) ? value : inputValue;

        const isBlurEvent = type === EVENTS.BLUR;
        const {
          isOnBlur: isReValidateOnBlur,
          isOnChange: isReValidateOnChange,
        } = getValidationModes(reValidateMode);

        const shouldSkipValidation =
          (!hasValidation(field._f, field._f.mount) &&
            !resolver &&
            !get(formStateRef.current.errors, name)) ||
          skipValidation({
            isBlurEvent,
            isTouched: !!get(formStateRef.current.touchedFields, name),
            isSubmitted: formStateRef.current.isSubmitted,
            isReValidateOnBlur,
            isReValidateOnChange,
            ...validationMode,
          });
        const isWatched =
          !isBlurEvent && isFieldWatched(name as FieldPath<TFieldValues>);

        if (!isUndefined(inputValue)) {
          field._f.value = inputValue;
        }

        const inputState = updateAndGetDirtyState(name, field._f.value, false);

        if (isBlurEvent && !get(formStateRef.current.touchedFields, name)) {
          set(formStateRef.current.touchedFields, name, true);
          readFormStateRef.current.touchedFields &&
            (inputState.touchedFields = formStateRef.current.touchedFields);
        }

        const shouldRender = !isEmptyObject(inputState) || isWatched;

        if (shouldSkipValidation) {
          !isBlurEvent &&
            subjectsRef.current.watch.next({
              name,
              type,
              values: getValues(),
            });
          return (
            shouldRender &&
            subjectsRef.current.state.next(
              isWatched ? { name } : { ...inputState, name },
            )
          );
        }

        subjectsRef.current.state.next({
          isValidating: true,
        });

        if (resolver) {
          const { errors } = await resolver(
            getFieldsValues(fieldsRef),
            contextRef.current,
            getResolverOptions([name], fieldsRef.current, criteriaMode),
          );
          error = get(errors, name);

          if (isCheckBoxInput(target as Ref) && !error) {
            const parentNodeName = getNodeParentName(name);
            const currentError = get(errors, parentNodeName, {});
            currentError.type && currentError.message && (error = currentError);

            if (
              currentError ||
              get(formStateRef.current.errors, parentNodeName)
            ) {
              name = parentNodeName;
            }
          }

          isValid = isEmptyObject(errors);
        } else {
          error = (await validateField(field, isValidateAllFieldCriteria))[
            name
          ];
        }

        !isBlurEvent &&
          subjectsRef.current.watch.next({
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
    },
    [],
  );

  const getValues: UseFormGetValues<TFieldValues> = (
    fieldNames?:
      | FieldPath<TFieldValues>
      | ReadonlyArray<FieldPath<TFieldValues>>,
  ) => {
    const values = {
      ...defaultValuesRef.current,
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
          unset(formStateRef.current.errors, inputName),
        )
      : (formStateRef.current.errors = {});

    subjectsRef.current.state.next({
      errors: formStateRef.current.errors,
    });
  };

  const setError: UseFormSetError<TFieldValues> = (name, error, options) => {
    const ref = (
      ((get(fieldsRef.current, name) as Field) || { _f: {} })._f || {}
    ).ref;

    set(formStateRef.current.errors, name, {
      ...error,
      ref,
    });

    subjectsRef.current.state.next({
      name,
      errors: formStateRef.current.errors,
      isValid: false,
    });

    options && options.shouldFocus && ref && ref.focus && ref.focus();
  };

  const watchInternal: WatchInternal<TFieldValues> = React.useCallback(
    (fieldNames, defaultValue, isGlobal, formValues) => {
      const isArrayNames = Array.isArray(fieldNames);
      const fieldValues =
        formValues || isMountedRef.current
          ? {
              ...defaultValuesRef.current,
              ...(formValues || getFieldsValues(fieldsRef)),
            }
          : isUndefined(defaultValue)
          ? defaultValuesRef.current
          : isArrayNames
          ? defaultValue
          : { [fieldNames as InternalFieldName]: defaultValue };

      if (isUndefined(fieldNames)) {
        isGlobal && (namesRef.current.watchAll = true);
        return fieldValues;
      }

      const result = [];

      for (const fieldName of convertToArrayPayload(fieldNames)) {
        isGlobal && namesRef.current.watch.add(fieldName as InternalFieldName);
        result.push(get(fieldValues, fieldName as InternalFieldName));
      }

      return isArrayNames ? result : result[0];
    },
    [],
  );

  const watch: UseFormWatch<TFieldValues> = (
    fieldName?:
      | FieldPath<TFieldValues>
      | ReadonlyArray<FieldPath<TFieldValues>>
      | WatchObserver<TFieldValues>,
    defaultValue?: unknown,
  ) =>
    isFunction(fieldName)
      ? subjectsRef.current.watch.subscribe({
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
      : namesRef.current.mount) {
      namesRef.current.mount.delete(inputName);
      namesRef.current.array.delete(inputName);

      if (get(fieldsRef.current, inputName) as Field) {
        !options.keepError && unset(formStateRef.current.errors, inputName);
        !options.keepValue && unset(fieldsRef.current, inputName);
        !options.keepDirty &&
          unset(formStateRef.current.dirtyFields, inputName);
        !options.keepTouched &&
          unset(formStateRef.current.touchedFields, inputName);
        !shouldUnregister &&
          !options.keepDefaultValue &&
          unset(defaultValuesRef.current, inputName);

        subjectsRef.current.watch.next({
          name: inputName,
          values: getValues(),
        });
      }
    }

    subjectsRef.current.state.next({
      ...formStateRef.current,
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
    let field = get(fieldsRef.current, name) as Field;

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

    set(fieldsRef.current, name, field);

    updateValidAndValue(name, ref);
  };

  const register: UseFormRegister<TFieldValues> = React.useCallback(
    (name, options = {}) => {
      const field = get(fieldsRef.current, name);

      set(fieldsRef.current, name, {
        _f: {
          ...(field && field._f ? field._f : { ref: { name } }),
          name,
          mount: true,
          ...options,
        },
      });
      namesRef.current.mount.add(name);

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
                const field = get(fieldsRef.current, name, {}) as Field;
                const shouldUnmount =
                  shouldUnregister || options.shouldUnregister;

                if (field._f) {
                  field._f.mount = false;
                  // If initial state of field element is disabled,
                  // value is not set on first "register"
                  // re-sync the value in when it switched to enabled
                  if (isUndefined(field._f.value)) {
                    field._f.value = field._f.ref.value;
                  }
                }

                if (
                  isNameInFieldArray(namesRef.current.array, name)
                    ? shouldUnmount && !inFieldArrayActionRef.current
                    : shouldUnmount
                ) {
                  namesRef.current.unMount.add(name);
                }
              }
            },
          };
    },
    [],
  );

  const handleSubmit: UseFormHandleSubmit<TFieldValues> = React.useCallback(
    (onValid, onInvalid) => async (e) => {
      if (e) {
        e.preventDefault && e.preventDefault();
        e.persist && e.persist();
      }
      let hasNoPromiseError = true;
      let fieldValues = getFieldsValues(fieldsRef);

      subjectsRef.current.state.next({
        isSubmitting: true,
      });

      try {
        if (resolver) {
          const { errors, values } = await resolver(
            fieldValues,
            contextRef.current,
            getResolverOptions(
              namesRef.current.mount,
              fieldsRef.current,
              criteriaMode,
            ),
          );
          formStateRef.current.errors = errors;
          fieldValues = values;
        } else {
          await validateForm(fieldsRef.current);
        }

        if (
          isEmptyObject(formStateRef.current.errors) &&
          Object.keys(formStateRef.current.errors).every((name) =>
            get(fieldValues, name),
          )
        ) {
          subjectsRef.current.state.next({
            errors: {},
            isSubmitting: true,
          });
          await onValid(fieldValues, e);
        } else {
          onInvalid && (await onInvalid(formStateRef.current.errors, e));
          shouldFocusError &&
            focusFieldBy(
              fieldsRef.current,
              (key) => get(formStateRef.current.errors, key),
              namesRef.current.mount,
            );
        }
      } catch (err) {
        hasNoPromiseError = false;
        throw err;
      } finally {
        formStateRef.current.isSubmitted = true;
        subjectsRef.current.state.next({
          isSubmitted: true,
          isSubmitting: false,
          isSubmitSuccessful:
            isEmptyObject(formStateRef.current.errors) && hasNoPromiseError,
          submitCount: formStateRef.current.submitCount + 1,
          errors: formStateRef.current.errors,
        });
      }
    },
    [shouldFocusError, isValidateAllFieldCriteria, criteriaMode],
  );

  const resetFromState = React.useCallback(
    (
      {
        keepErrors,
        keepDirty,
        keepIsSubmitted,
        keepTouched,
        keepDefaultValues,
        keepIsValid,
        keepSubmitCount,
      }: KeepStateOptions,
      values?: DefaultValues<TFieldValues>,
    ) => {
      namesRef.current = {
        mount: new Set(),
        unMount: new Set(),
        array: new Set(),
        watch: new Set(),
        watchAll: false,
      };

      subjectsRef.current.state.next({
        submitCount: keepSubmitCount ? formStateRef.current.submitCount : 0,
        isDirty: keepDirty
          ? formStateRef.current.isDirty
          : keepDefaultValues
          ? deepEqual(values, defaultValuesRef.current)
          : false,
        isSubmitted: keepIsSubmitted ? formStateRef.current.isSubmitted : false,
        dirtyFields: keepDirty ? formStateRef.current.dirtyFields : {},
        touchedFields: keepTouched ? formStateRef.current.touchedFields : {},
        errors: keepErrors ? formStateRef.current.errors : {},
        isSubmitting: false,
        isSubmitSuccessful: false,
      });

      isMountedRef.current = !keepIsValid;
    },
    [],
  );

  const registerAbsentFields = <T extends DefaultValues<TFieldValues>>(
    value: T,
    name = '',
  ): void => {
    const field = get(fieldsRef.current, name);

    if (!field || (field && !field._f)) {
      if (
        !field &&
        (isPrimitive(value) ||
          (isWeb && (value instanceof FileList || value instanceof Date)))
      ) {
        set(fieldsRef.current, name, {
          _f: {
            ref: { name, value },
            value,
            name,
          },
        });
      }

      if (Array.isArray(value) || isObject(value)) {
        if (name && !get(fieldsRef.current, name)) {
          set(fieldsRef.current, name, Array.isArray(value) ? [] : {});
        }

        for (const key in value) {
          registerAbsentFields(value[key], name + (name ? '.' : '') + key);
        }
      }
    }
  };

  const reset: UseFormReset<TFieldValues> = (values, keepStateOptions = {}) => {
    const updatedValues = values || defaultValuesRef.current;

    if (isWeb && !keepStateOptions.keepValues) {
      for (const name of namesRef.current.mount) {
        const field = get(fieldsRef.current, name);
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
      (defaultValuesRef.current = { ...updatedValues });

    if (!keepStateOptions.keepValues) {
      fieldsRef.current = {};

      subjectsRef.current.control.next({
        values: { ...updatedValues },
      });

      subjectsRef.current.watch.next({
        values: { ...updatedValues },
      });

      subjectsRef.current.array.next({
        values: { ...updatedValues },
        isReset: true,
      });
    }

    !keepStateOptions.keepDefaultValues &&
      !shouldUnregister &&
      registerAbsentFields({ ...updatedValues });

    resetFromState(keepStateOptions, values);
  };

  const setFocus: UseFormSetFocus<TFieldValues> = (name) =>
    get(fieldsRef.current, name)._f.ref.focus();

  React.useEffect(() => {
    !shouldUnregister && registerAbsentFields(defaultValuesRef.current);

    const formStateSubscription = subjectsRef.current.state.subscribe({
      next(formState) {
        if (shouldRenderFormState(formState, readFormStateRef.current, true)) {
          formStateRef.current = {
            ...formStateRef.current,
            ...formState,
          };
          updateFormState(formStateRef.current);
        }
      },
    });

    const useFieldArraySubscription = subjectsRef.current.array.subscribe({
      next(state) {
        if (state.values && state.name && readFormStateRef.current.isValid) {
          const values = getFieldsValues(fieldsRef);
          set(values, state.name, state.values);
          updateIsValid(values);
        }
      },
    });

    return () => {
      formStateSubscription.unsubscribe();
      useFieldArraySubscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    const isLiveInDom = (ref: Ref) =>
      !isHTMLElement(ref) || !document.contains(ref);

    if (!isMountedRef.current) {
      isMountedRef.current = true;
      readFormStateRef.current.isValid && updateIsValid();
    }

    for (const name of namesRef.current.unMount) {
      const field = get(fieldsRef.current, name) as Field;

      field &&
        (field._f.refs
          ? field._f.refs.every(isLiveInDom)
          : isLiveInDom(field._f.ref)) &&
        unregister(name as FieldPath<TFieldValues>);
    }

    namesRef.current.unMount = new Set();
  });

  return {
    control: React.useMemo(
      () => ({
        register,
        inFieldArrayActionRef,
        getIsDirty,
        subjectsRef,
        watchInternal,
        fieldsRef,
        updateIsValid,
        namesRef,
        readFormStateRef,
        formStateRef,
        defaultValuesRef,
        fieldArrayDefaultValuesRef,
        unregister,
        shouldUnmount: shouldUnregister,
      }),
      [],
    ),
    formState: getProxyFormState<TFieldValues>(
      isProxyEnabled,
      formState,
      readFormStateRef,
    ),
    trigger,
    register,
    handleSubmit,
    watch: React.useCallback(watch, []),
    setValue: React.useCallback(setValue, [setInternalValues]),
    getValues: React.useCallback(getValues, []),
    reset: React.useCallback(reset, []),
    clearErrors: React.useCallback(clearErrors, []),
    unregister: React.useCallback(unregister, []),
    setError: React.useCallback(setError, []),
    setFocus: React.useCallback(setFocus, []),
  };
}
