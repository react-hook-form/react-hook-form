import * as React from 'react';

import focusFieldBy from './logic/focusFieldBy';
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
import debounce from './utils/debounce';
import deepEqual from './utils/deepEqual';
import get from './utils/get';
import getValidationModes from './utils/getValidationModes';
import isCheckBoxInput from './utils/isCheckBoxInput';
import isDateObject from './utils/isDateObject';
import isEmptyObject from './utils/isEmptyObject';
import isFileInput from './utils/isFileInput';
import isFunction from './utils/isFunction';
import isHTMLElement from './utils/isHTMLElement';
import isMultipleSelect from './utils/isMultipleSelect';
import isNullOrUndefined from './utils/isNullOrUndefined';
import isObject from './utils/isObject';
import isPrimitive from './utils/isPrimitive';
import isProxyEnabled from './utils/isProxyEnabled';
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
  ValidateHandler,
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
  delayError,
  shouldUseNativeValidation,
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
  const _proxyFormState = React.useRef<ReadFormState>({
    isDirty: !isProxyEnabled,
    dirtyFields: !isProxyEnabled,
    touchedFields: !isProxyEnabled,
    isValidating: !isProxyEnabled,
    isValid: !isProxyEnabled,
    errors: !isProxyEnabled,
  });
  const _resolver = React.useRef(resolver);
  const _formState = React.useRef(formState);
  const _fields = React.useRef<FieldRefs>({});
  const _formValues = React.useRef<FieldValues>({});
  const _defaultValues =
    React.useRef<DefaultValues<TFieldValues>>(defaultValues);
  const _fieldArrayDefaultValues = React.useRef<FieldArrayDefaultValues>({});
  const _context = React.useRef(context);
  const _isDuringAction = React.useRef(false);
  const _isMounted = React.useRef(false);
  const _delayCallback = React.useRef<any>();
  const _subjects: Subjects<TFieldValues> = React.useRef({
    watch: new Subject(),
    control: new Subject(),
    array: new Subject(),
    state: new Subject(),
  });
  const _names = React.useRef<Names>({
    mount: new Set(),
    unMount: new Set(),
    array: new Set(),
    watch: new Set(),
    watchAll: false,
  });

  const validationMode = getValidationModes(mode);
  const isValidateAllFieldCriteria = criteriaMode === VALIDATION_MODE.all;
  _resolver.current = resolver;
  _context.current = context;

  const isFieldWatched = (name: FieldPath<TFieldValues>) =>
    _names.current.watchAll ||
    _names.current.watch.has(name) ||
    _names.current.watch.has((name.match(/\w+/) || [])[0]);

  const shouldRenderBaseOnError = React.useCallback(
    async (
      shouldSkipRender: boolean,
      name: InternalFieldName,
      error?: FieldError,
      fieldState?: {
        dirty?: FieldNamesMarkedBoolean<TFieldValues>;
        isDirty?: boolean;
        touched?: FieldNamesMarkedBoolean<TFieldValues>;
      },
      isValidFromResolver?: boolean,
      isWatched?: boolean,
    ): Promise<void> => {
      const previousError = get(_formState.current.errors, name);
      const isValid = _proxyFormState.current.isValid
        ? resolver
          ? isValidFromResolver
          : await validateForm(_fields.current, true)
        : false;

      error
        ? set(_formState.current.errors, name, error)
        : unset(_formState.current.errors, name);

      if (
        (isWatched ||
          (error ? !deepEqual(previousError, error, true) : previousError) ||
          !isEmptyObject(fieldState) ||
          _formState.current.isValid !== isValid) &&
        !shouldSkipRender
      ) {
        const updatedFormState = {
          ...fieldState,
          isValid: !!isValid,
          errors: _formState.current.errors,
          name,
        };

        _formState.current = {
          ..._formState.current,
          ...updatedFormState,
        };

        _subjects.current.state.next(isWatched ? { name } : updatedFormState);
      }

      _subjects.current.state.next({
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
      const field = get(_fields.current, name);

      if (field) {
        const _f = (field as Field)._f;

        if (_f) {
          const value =
            isWeb && isHTMLElement(_f.ref) && isNullOrUndefined(rawValue)
              ? ''
              : rawValue;
          const fieldValue = getFieldValueAs(rawValue, _f);

          if (isFileInput(_f.ref) && !isString(value)) {
            _f.ref.files = value as FileList;
          } else if (isMultipleSelect(_f.ref)) {
            [..._f.ref.options].forEach(
              (selectRef) =>
                (selectRef.selected = (value as InternalFieldName[]).includes(
                  selectRef.value,
                )),
            );
          } else if (_f.refs) {
            if (isCheckBoxInput(_f.ref)) {
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
              _f.refs.forEach(
                (radioRef: HTMLInputElement) =>
                  (radioRef.checked = radioRef.value === value),
              );
            }
          } else {
            _f.ref.value = value;
          }

          set(_formValues.current, name, fieldValue);

          if (shouldRender) {
            _subjects.current.control.next({
              values: getValues(),
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
          set(_formValues.current, name, rawValue);
        }
      }
    },
    [],
  );

  const getIsDirty: GetIsDirty = React.useCallback((name, data) => {
    name && data && set(_formValues.current, name, data);

    return !deepEqual({ ...getValues() }, _defaultValues.current);
  }, []);

  const updateTouchAndDirtyState = React.useCallback(
    (
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

      if (_proxyFormState.current.isDirty) {
        const previousIsDirty = _formState.current.isDirty;
        _formState.current.isDirty = getIsDirty();
        state.isDirty = _formState.current.isDirty;
        isChanged = previousIsDirty !== state.isDirty;
      }

      if (_proxyFormState.current.dirtyFields && !isCurrentTouched) {
        const isPreviousFieldDirty = get(_formState.current.dirtyFields, name);
        const isCurrentFieldDirty = !deepEqual(
          get(_defaultValues.current, name),
          inputValue,
        );
        isCurrentFieldDirty
          ? set(_formState.current.dirtyFields, name, true)
          : unset(_formState.current.dirtyFields, name);
        state.dirtyFields = _formState.current.dirtyFields;
        isChanged =
          isChanged ||
          isPreviousFieldDirty !== get(_formState.current.dirtyFields, name);
      }

      const isPreviousFieldTouched = get(
        _formState.current.touchedFields,
        name,
      );

      if (isCurrentTouched && !isPreviousFieldTouched) {
        set(_formState.current.touchedFields, name, isCurrentTouched);
        state.touchedFields = _formState.current.touchedFields;
        isChanged =
          isChanged ||
          (_proxyFormState.current.touchedFields &&
            isPreviousFieldTouched !== isCurrentTouched);
      }

      isChanged && shouldRender && _subjects.current.state.next(state);

      return isChanged ? state : {};
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
          get(_fields.current, name) as Field,
          get(getValues(), name),
          isValidateAllFieldCriteria,
          shouldUseNativeValidation,
        )
      )[name];

      await shouldRenderBaseOnError(skipReRender, name, error);

      return isUndefined(error);
    },
    [isValidateAllFieldCriteria],
  );

  const executeResolverValidation = React.useCallback(
    async (names?: InternalFieldName[]) => {
      const { errors } = await _resolver.current!(
        getValues(),
        _context.current,
        getResolverOptions(
          _names.current.mount,
          _fields.current,
          criteriaMode,
          shouldUseNativeValidation,
        ),
      );

      if (names) {
        for (const name of names) {
          const error = get(errors, name);
          error
            ? set(_formState.current.errors, name, error)
            : unset(_formState.current.errors, name);
        }
      } else {
        _formState.current.errors = errors;
      }

      return errors;
    },
    [criteriaMode, shouldUseNativeValidation],
  );

  const validateForm = async (
    _fields: FieldRefs,
    shouldCheckValid?: boolean,
    context = {
      valid: true,
    },
  ) => {
    for (const name in _fields) {
      const field = _fields[name];

      if (field) {
        const _f = field._f;
        const current = omit(field, '_f');

        if (_f) {
          const fieldError = await validateField(
            field,
            get(getValues(), _f.name),
            isValidateAllFieldCriteria,
            shouldUseNativeValidation,
          );

          if (shouldCheckValid) {
            if (fieldError[_f.name]) {
              context.valid = false;
              break;
            }
          } else {
            fieldError[_f.name]
              ? set(_formState.current.errors, _f.name, fieldError[_f.name])
              : unset(_formState.current.errors, _f.name);
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

      _subjects.current.state.next({
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
        if (name) {
          isValid = (
            await Promise.all(
              fieldNames
                .filter((fieldName) => get(_fields.current, fieldName, {})._f)
                .map(
                  async (fieldName) =>
                    await executeInlineValidation(fieldName, true),
                ),
            )
          ).every(Boolean);
        } else {
          await validateForm(_fields.current);
          isValid = isEmptyObject(_formState.current.errors);
        }
      }

      _subjects.current.state.next({
        ...(isString(name) ? { name } : {}),
        errors: _formState.current.errors,
        isValidating: false,
      });

      if (options.shouldFocus && !isValid) {
        focusFieldBy(
          _fields.current,
          (key) => get(_formState.current.errors, key),
          name ? fieldNames : _names.current.mount,
        );
      }

      _proxyFormState.current.isValid && updateValid();

      return isValid;
    },
    [executeResolverValidation, executeInlineValidation],
  );

  const updateValidAndInputValue = (name: InternalFieldName, ref?: Ref) => {
    const field = get(_fields.current, name) as Field;
    const fieldValue = get(getValues(), name);

    if (field) {
      const isValueUndefined = isUndefined(fieldValue);
      const defaultValue = isValueUndefined
        ? isUndefined(get(_fieldArrayDefaultValues.current, name))
          ? get(_defaultValues.current, name)
          : get(_fieldArrayDefaultValues.current, name)
        : fieldValue;

      if (!isUndefined(defaultValue)) {
        if (ref && (ref as HTMLInputElement).defaultChecked) {
          set(_formValues.current, name, getFieldValue(field));
        } else {
          setFieldValue(name, defaultValue);
        }
      } else if (isValueUndefined) {
        set(_formValues.current, name, getFieldValue(field));
      }
    }

    _isMounted.current && _proxyFormState.current.isValid && updateValid();
  };

  const updateValid = React.useCallback(async () => {
    const isValid = resolver
      ? isEmptyObject(
          (
            await _resolver.current!(
              getValues(),
              _context.current,
              getResolverOptions(
                _names.current.mount,
                _fields.current,
                criteriaMode,
                shouldUseNativeValidation,
              ),
            )
          ).errors,
        )
      : await validateForm(_fields.current, true);

    isValid !== _formState.current.isValid &&
      _subjects.current.state.next({
        isValid,
      });
  }, [criteriaMode, shouldUseNativeValidation]);

  const setValues = React.useCallback(
    (
      name: FieldPath<TFieldValues>,
      value: UnpackNestedValue<
        PathValue<TFieldValues, FieldPath<TFieldValues>>
      >,
      options: SetValueConfig,
    ) =>
      Object.entries(value).forEach(([fieldKey, fieldValue]) => {
        const fieldName = `${name}.${fieldKey}` as Path<TFieldValues>;
        const field = get(_fields.current, fieldName);
        const isFieldArray = _names.current.array.has(name);

        (isFieldArray || !isPrimitive(fieldValue) || (field && !field._f)) &&
        !isDateObject(fieldValue)
          ? setValues(
              fieldName,
              fieldValue as SetFieldValue<TFieldValues>,
              options,
            )
          : setFieldValue(
              fieldName,
              fieldValue as SetFieldValue<TFieldValues>,
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
    const field = get(_fields.current, name);
    const isFieldArray = _names.current.array.has(name);

    if (isFieldArray) {
      _subjects.current.array.next({
        values: value,
        name,
        isReset: true,
      });

      if (
        (_proxyFormState.current.isDirty ||
          _proxyFormState.current.dirtyFields) &&
        options.shouldDirty
      ) {
        set(
          _formState.current.dirtyFields,
          name,
          setFieldArrayDirtyFields(
            value,
            get(_defaultValues.current, name, []),
            get(_formState.current.dirtyFields, name, []),
          ),
        );

        _subjects.current.state.next({
          name,
          dirtyFields: _formState.current.dirtyFields,
          isDirty: getIsDirty(name, value),
        });
      }

      !(value as []).length && set(_fieldArrayDefaultValues.current, name, []);
    }

    set(_formValues.current, name, value);

    ((field && !field._f) || isFieldArray) && !isNullOrUndefined(value)
      ? setValues(name, value, isFieldArray ? {} : options)
      : setFieldValue(name, value, options, true, !field);

    isFieldWatched(name) && _subjects.current.state.next({});
    _subjects.current.watch.next({
      name,
    });
  };

  const handleValidate: ValidateHandler = async (
    target,
    fieldState,
    isWatched,
    isBlurEvent,
  ) => {
    let error;
    let isValid;
    let name = target.name;
    const field = get(_fields.current, name) as Field;

    if (resolver) {
      const { errors } = await _resolver.current!(
        getValues(),
        _context.current,
        getResolverOptions(
          [name],
          _fields.current,
          criteriaMode,
          shouldUseNativeValidation,
        ),
      );
      error = get(errors, name);

      if (isCheckBoxInput(target as Ref) && !error) {
        const parentNodeName = getNodeParentName(name);
        const currentError = get(errors, parentNodeName, {});
        currentError.type && currentError.message && (error = currentError);

        if (currentError || get(_formState.current.errors, parentNodeName)) {
          name = parentNodeName;
        }
      }

      isValid = isEmptyObject(errors);
    } else {
      error = (
        await validateField(
          field,
          get(_formValues.current, name) as Field,
          isValidateAllFieldCriteria,
          shouldUseNativeValidation,
        )
      )[name];
    }

    !isBlurEvent &&
      _subjects.current.watch.next({
        name,
        type: target.type,
      });

    shouldRenderBaseOnError(false, name, error, fieldState, isValid, isWatched);
  };

  const handleChange: ChangeHandler = React.useCallback(
    async ({ type, target, target: { value, name, type: inputType } }) => {
      const field = get(_fields.current, name) as Field;

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
            !get(_formState.current.errors, name)) ||
          skipValidation({
            isBlurEvent,
            isTouched: !!get(_formState.current.touchedFields, name),
            isSubmitted: _formState.current.isSubmitted,
            isReValidateOnBlur,
            isReValidateOnChange,
            ...validationMode,
          });
        const isWatched =
          !isBlurEvent && isFieldWatched(name as FieldPath<TFieldValues>);

        if (!isUndefined(inputValue)) {
          set(_formValues.current, name, inputValue);
        }

        const fieldState = updateTouchAndDirtyState(
          name,
          inputValue,
          isBlurEvent,
          false,
        );

        const shouldRender = !isEmptyObject(fieldState) || isWatched;

        if (shouldSkipValidation) {
          !isBlurEvent &&
            _subjects.current.watch.next({
              name,
              type,
            });
          return (
            shouldRender &&
            _subjects.current.state.next(
              isWatched ? { name } : { ...fieldState, name },
            )
          );
        }

        _subjects.current.state.next({
          isValidating: true,
        });

        if (get(_formState.current.errors, name) || !delayError) {
          handleValidate(target, fieldState, isWatched, isBlurEvent);
        } else {
          _delayCallback.current =
            _delayCallback.current || debounce(handleValidate, delayError);

          _delayCallback.current(target, fieldState, isWatched, isBlurEvent);
          isWatched && _subjects.current.state.next({ name });
        }
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
      ..._defaultValues.current,
      ..._formValues.current,
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
          unset(_formState.current.errors, inputName),
        )
      : (_formState.current.errors = {});

    _subjects.current.state.next({
      errors: _formState.current.errors,
    });
  };

  const setError: UseFormSetError<TFieldValues> = (name, error, options) => {
    const ref = (((get(_fields.current, name) as Field) || { _f: {} })._f || {})
      .ref;

    set(_formState.current.errors, name, {
      ...error,
      ref,
    });

    _subjects.current.state.next({
      name,
      errors: _formState.current.errors,
      isValid: false,
    });

    options && options.shouldFocus && ref && ref.focus && ref.focus();
  };

  const getWatch: WatchInternal<TFieldValues> = React.useCallback(
    (fieldNames, defaultValue, isGlobal) => {
      const fieldValues = {
        ...(_isMounted.current
          ? getValues()
          : isUndefined(defaultValue)
          ? _defaultValues.current
          : defaultValue),
      };

      if (!fieldNames) {
        isGlobal && (_names.current.watchAll = true);
        return fieldValues;
      }

      const result = [];

      for (const fieldName of convertToArrayPayload(fieldNames)) {
        isGlobal && _names.current.watch.add(fieldName as InternalFieldName);
        result.push(get(fieldValues, fieldName as InternalFieldName));
      }

      return Array.isArray(fieldNames)
        ? result
        : isObject(result[0])
        ? { ...result[0] }
        : Array.isArray(result[0])
        ? [...result[0]]
        : result[0];
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
      ? _subjects.current.watch.subscribe({
          next: (info) =>
            fieldName(
              getWatch(
                undefined,
                defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>,
              ) as UnpackNestedValue<TFieldValues>,
              info,
            ),
        })
      : getWatch(
          fieldName as InternalFieldName | InternalFieldName[],
          defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>,
          true,
        );

  const unregister: UseFormUnregister<TFieldValues> = (name, options = {}) => {
    for (const inputName of name
      ? convertToArrayPayload(name)
      : _names.current.mount) {
      _names.current.mount.delete(inputName);
      _names.current.array.delete(inputName);

      if (get(_fields.current, inputName) as Field) {
        if (!options.keepValue) {
          unset(_fields.current, inputName);
          unset(_formValues.current, inputName);
        }

        !options.keepError && unset(_formState.current.errors, inputName);
        !options.keepDirty && unset(_formState.current.dirtyFields, inputName);
        !options.keepTouched &&
          unset(_formState.current.touchedFields, inputName);
        !shouldUnregister &&
          !options.keepDefaultValue &&
          unset(_defaultValues.current, inputName);
      }
    }

    _subjects.current.watch.next({});

    _subjects.current.state.next({
      ..._formState.current,
      ...(!options.keepDirty ? {} : { isDirty: getIsDirty() }),
    });
    !options.keepIsValid && updateValid();
  };

  const registerFieldRef = (
    name: InternalFieldName,
    ref: HTMLInputElement,
    options?: RegisterOptions,
  ): ((name: InternalFieldName) => void) | void => {
    register(name as FieldPath<TFieldValues>, options);
    let field = get(_fields.current, name) as Field;

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

    set(_fields.current, name, field);

    updateValidAndInputValue(name, ref);
  };

  const register: UseFormRegister<TFieldValues> = React.useCallback(
    (name, options = {}) => {
      const field = get(_fields.current, name);

      set(_fields.current, name, {
        _f: {
          ...(field && field._f ? field._f : { ref: { name } }),
          name,
          mount: true,
          ...options,
        },
      });

      if (options.value) {
        set(_formValues.current, name, options.value);
      }

      if (
        !isUndefined(options.disabled) &&
        field &&
        field._f &&
        field._f.ref.disabled !== options.disabled
      ) {
        set(
          _formValues.current,
          name,
          options.disabled ? undefined : field._f.ref.value,
        );
      }

      _names.current.mount.add(name);
      !field && updateValidAndInputValue(name);

      return isWindowUndefined
        ? ({ name: name as InternalFieldName } as UseFormRegisterReturn)
        : {
            name,
            ...(isUndefined(options.disabled)
              ? {}
              : { disabled: options.disabled }),
            onChange: handleChange,
            onBlur: handleChange,
            ref: (ref: HTMLInputElement | null): void => {
              if (ref) {
                registerFieldRef(name, ref, options);
              } else {
                const field = get(_fields.current, name, {}) as Field;
                const shouldUnmount =
                  shouldUnregister || options.shouldUnregister;

                if (field._f) {
                  field._f.mount = false;
                }

                shouldUnmount &&
                  !(
                    isNameInFieldArray(_names.current.array, name) &&
                    _isDuringAction.current
                  ) &&
                  _names.current.unMount.add(name);
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
      let fieldValues: any = { ..._formValues.current };

      _subjects.current.state.next({
        isSubmitting: true,
      });

      try {
        if (resolver) {
          const { errors, values } = await _resolver.current!(
            fieldValues as UnpackNestedValue<TFieldValues>,
            _context.current,
            getResolverOptions(
              _names.current.mount,
              _fields.current,
              criteriaMode,
              shouldUseNativeValidation,
            ),
          );
          _formState.current.errors = errors;
          fieldValues = values;
        } else {
          await validateForm(_fields.current);
        }

        if (
          isEmptyObject(_formState.current.errors) &&
          Object.keys(_formState.current.errors).every((name) =>
            get(fieldValues, name),
          )
        ) {
          _subjects.current.state.next({
            errors: {},
            isSubmitting: true,
          });
          await onValid(fieldValues, e);
        } else {
          onInvalid && (await onInvalid(_formState.current.errors, e));
          shouldFocusError &&
            focusFieldBy(
              _fields.current,
              (key) => get(_formState.current.errors, key),
              _names.current.mount,
            );
        }
      } catch (err) {
        hasNoPromiseError = false;
        throw err;
      } finally {
        _formState.current.isSubmitted = true;
        _subjects.current.state.next({
          isSubmitted: true,
          isSubmitting: false,
          isSubmitSuccessful:
            isEmptyObject(_formState.current.errors) && hasNoPromiseError,
          submitCount: _formState.current.submitCount + 1,
          errors: _formState.current.errors,
        });
      }
    },
    [
      shouldFocusError,
      isValidateAllFieldCriteria,
      criteriaMode,
      shouldUseNativeValidation,
    ],
  );

  const registerAbsentFields = <T extends DefaultValues<TFieldValues>>(
    defaultValues: T,
    name = '',
  ): void => {
    for (const key in defaultValues) {
      const value = defaultValues[key];
      const fieldName = name + (name ? '.' : '') + key;
      const field = get(_fields.current, fieldName);

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
    const updatedValues = values || _defaultValues.current;

    if (isWeb && !keepStateOptions.keepValues) {
      for (const name of _names.current.mount) {
        const field = get(_fields.current, name);
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

    if (!keepStateOptions.keepDefaultValues) {
      _defaultValues.current = { ...updatedValues };
      _fieldArrayDefaultValues.current = { ...updatedValues };
    }

    if (!keepStateOptions.keepValues) {
      _fields.current = {};
      _formValues.current = {};

      _subjects.current.control.next({
        values: keepStateOptions.keepDefaultValues
          ? _defaultValues.current
          : { ...updatedValues },
      });

      _subjects.current.watch.next({});

      _subjects.current.array.next({
        values: { ...updatedValues },
        isReset: true,
      });
    }

    _names.current = {
      mount: new Set(),
      unMount: new Set(),
      array: new Set(),
      watch: new Set(),
      watchAll: false,
    };

    _subjects.current.state.next({
      submitCount: keepStateOptions.keepSubmitCount
        ? _formState.current.submitCount
        : 0,
      isDirty: keepStateOptions.keepDirty
        ? _formState.current.isDirty
        : keepStateOptions.keepDefaultValues
        ? deepEqual(values, _defaultValues.current)
        : false,
      isSubmitted: keepStateOptions.keepIsSubmitted
        ? _formState.current.isSubmitted
        : false,
      dirtyFields: keepStateOptions.keepDirty
        ? _formState.current.dirtyFields
        : {},
      touchedFields: keepStateOptions.keepTouched
        ? _formState.current.touchedFields
        : {},
      errors: keepStateOptions.keepErrors ? _formState.current.errors : {},
      isSubmitting: false,
      isSubmitSuccessful: false,
    });

    _isMounted.current = !!keepStateOptions.keepIsValid;
  };

  const setFocus: UseFormSetFocus<TFieldValues> = (name) =>
    get(_fields.current, name)._f.ref.focus();

  React.useEffect(() => {
    const formStateSubscription = _subjects.current.state.subscribe({
      next(formState) {
        if (shouldRenderFormState(formState, _proxyFormState.current, true)) {
          _formState.current = {
            ..._formState.current,
            ...formState,
          };
          updateFormState(_formState.current);
        }
      },
    });

    const useFieldArraySubscription = _subjects.current.array.subscribe({
      next(state) {
        if (state.values && state.name && _proxyFormState.current.isValid) {
          set(_formValues.current, state.name, state.values);
          updateValid();
        }
      },
    });

    return () => {
      formStateSubscription.unsubscribe();
      useFieldArraySubscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    const unregisterFieldNames = [];
    const isLiveInDom = (ref: Ref) =>
      !isHTMLElement(ref) || !document.contains(ref);

    if (!_isMounted.current) {
      _isMounted.current = true;
      _proxyFormState.current.isValid && updateValid();
      !shouldUnregister && registerAbsentFields(_defaultValues.current);
    }

    for (const name of _names.current.unMount) {
      const field = get(_fields.current, name) as Field;

      field &&
        (field._f.refs
          ? field._f.refs.every(isLiveInDom)
          : isLiveInDom(field._f.ref)) &&
        unregisterFieldNames.push(name);
    }

    unregisterFieldNames.length &&
      unregister(unregisterFieldNames as FieldPath<TFieldValues>[]);

    _names.current.unMount = new Set();
  });

  return {
    control: React.useMemo(
      () => ({
        register,
        setValues,
        getIsDirty,
        getWatch,
        updateValid,
        unregister,
        shouldUnmount: shouldUnregister,
        _fields,
        _isDuringAction,
        _subjects,
        _names,
        _proxyFormState,
        _formState,
        _defaultValues,
        _fieldArrayDefaultValues,
        _formValues,
      }),
      [],
    ),
    formState: getProxyFormState<TFieldValues>(
      isProxyEnabled,
      formState,
      _proxyFormState,
    ),
    trigger,
    register,
    handleSubmit,
    watch: React.useCallback(watch, []),
    setValue: React.useCallback(setValue, [setValues]),
    getValues: React.useCallback(getValues, []),
    reset: React.useCallback(reset, []),
    clearErrors: React.useCallback(clearErrors, []),
    unregister: React.useCallback(unregister, []),
    setError: React.useCallback(setError, []),
    setFocus: React.useCallback(setFocus, []),
  };
}
