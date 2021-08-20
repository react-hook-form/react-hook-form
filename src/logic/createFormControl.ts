import { EVENTS, VALIDATION_MODE } from '../constants';
import {
  BatchFieldArrayUpdate,
  ChangeHandler,
  DeepPartial,
  DelayCallback,
  Field,
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
  Ref,
  RegisterMissFields,
  RegisterOptions,
  ResolverResult,
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
} from '../types';
import { set } from '../utils';
import cloneObject from '../utils/cloneObject';
import compact from '../utils/compact';
import convertToArrayPayload from '../utils/convertToArrayPayload';
import deepEqual from '../utils/deepEqual';
import get from '../utils/get';
import getValidationModes from '../utils/getValidationModes';
import isCheckBoxInput from '../utils/isCheckBoxInput';
import isDateObject from '../utils/isDateObject';
import isEmptyObject from '../utils/isEmptyObject';
import isFileInput from '../utils/isFileInput';
import isFunction from '../utils/isFunction';
import isHTMLElement from '../utils/isHTMLElement';
import isMultipleSelect from '../utils/isMultipleSelect';
import isNullOrUndefined from '../utils/isNullOrUndefined';
import isObject from '../utils/isObject';
import isPrimitive from '../utils/isPrimitive';
import isRadioOrCheckboxFunction from '../utils/isRadioOrCheckbox';
import isString from '../utils/isString';
import isUndefined from '../utils/isUndefined';
import isWeb from '../utils/isWeb';
import live from '../utils/live';
import omit from '../utils/omit';
import omitKey from '../utils/omitKeys';
import omitKeys from '../utils/omitKeys';
import Subject from '../utils/Subject';
import unset from '../utils/unset';

import focusFieldBy from './focusFieldBy';
import getFieldValue from './getFieldValue';
import getFieldValueAs from './getFieldValueAs';
import getNodeParentName from './getNodeParentName';
import getResolverOptions from './getResolverOptions';
import hasValidation from './hasValidation';
import isNameInFieldArray from './isNameInFieldArray';
import setFieldArrayDirtyFields from './setFieldArrayDirtyFields';
import skipValidation from './skipValidation';
import unsetEmptyArray from './unsetEmptyArray';
import validateField from './validateField';

const defaultOptions = {
  mode: VALIDATION_MODE.onSubmit,
  reValidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true,
} as const;

const isWindowUndefined = typeof window === 'undefined';

export function createFormControl<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object,
>(
  props: UseFormProps<TFieldValues, TContext> = {},
): Omit<UseFormReturn<TFieldValues, TContext>, 'formState'> {
  let formOptions = {
    ...defaultOptions,
    ...props,
  };
  let _delayCallback: DelayCallback;
  let _formState = {
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
  let _fields = {};
  let _formValues = {};
  let _defaultValues = formOptions.defaultValues || {};
  let _isInAction = false;
  let _isMounted = false;
  let _timer = 0;
  let _names: Names = {
    mount: new Set(),
    unMount: new Set(),
    array: new Set(),
    watch: new Set(),
  } as Names;
  let _validateCount: Record<InternalFieldName, number> = {};
  const _proxyFormState = {
    isDirty: false,
    dirtyFields: false,
    touchedFields: false,
    isValidating: false,
    isValid: false,
    errors: false,
  };
  const _subjects: Subjects<TFieldValues> = {
    watch: new Subject(),
    control: new Subject(),
    array: new Subject(),
    state: new Subject(),
  };

  const validationMode = getValidationModes(formOptions.mode);
  const isValidateAllFieldCriteria =
    formOptions.criteriaMode === VALIDATION_MODE.all;

  const debounce =
    <T extends Function>(callback: T, wait: number) =>
    (...args: any) => {
      clearTimeout(_timer);
      _timer = window.setTimeout(() => callback(...args), wait);
    };

  const isFieldWatched = (name: FieldPath<TFieldValues>) =>
    _names.watchAll ||
    _names.watch.has(name) ||
    _names.watch.has((name.match(/\w+/) || [])[0]);

  const updateErrorState = (name: InternalFieldName, error: FieldError) => {
    set(_formState.errors, name, error);

    _subjects.state.next({
      errors: _formState.errors,
    });
  };

  const shouldRenderBaseOnValid = async () => {
    const isValid = await validateForm(_fields, true);
    if (isValid !== _formState.isValid) {
      _formState.isValid = isValid;
      _subjects.state.next({
        isValid,
      });
    }
  };

  const shouldRenderBaseOnError = async (
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
    const previousError = get(_formState.errors, name);
    const isValid = !!(
      _proxyFormState.isValid &&
      (formOptions.resolver ? isValidFromResolver : shouldRenderBaseOnValid())
    );

    if (props.delayError && error) {
      _delayCallback =
        _delayCallback || debounce(updateErrorState, props.delayError);

      _delayCallback(name, error);
    } else {
      clearTimeout(_timer);
      error
        ? set(_formState.errors, name, error)
        : unset(_formState.errors, name);
    }

    if (
      (isWatched ||
        (error ? !deepEqual(previousError, error) : previousError) ||
        !isEmptyObject(fieldState) ||
        _formState.isValid !== isValid) &&
      !shouldSkipRender
    ) {
      const updatedFormState = {
        ...fieldState,
        ...(_proxyFormState.isValid && formOptions.resolver ? { isValid } : {}),
        errors: _formState.errors,
        name,
      };

      _formState = {
        ..._formState,
        ...updatedFormState,
      };

      _subjects.state.next(isWatched ? { name } : updatedFormState);
    }

    _validateCount[name]--;

    if (!_validateCount[name]) {
      _subjects.state.next({
        isValidating: false,
      });
      _validateCount = {};
    }
  };

  const setFieldValue = (
    name: InternalFieldName,
    value: SetFieldValue<TFieldValues>,
    options: SetValueConfig = {},
    shouldRender?: boolean,
  ) => {
    const field: Field = get(_fields, name);

    if (field) {
      const _f = field._f;

      if (_f) {
        set(_formValues, name, getFieldValueAs(value, _f));

        const fieldValue =
          isWeb && isHTMLElement(_f.ref) && isNullOrUndefined(value)
            ? ''
            : value;

        if (isFileInput(_f.ref) && !isString(fieldValue)) {
          _f.ref.files = fieldValue as FileList;
        } else if (isMultipleSelect(_f.ref)) {
          [..._f.ref.options].forEach(
            (selectRef) =>
              (selectRef.selected = (
                fieldValue as InternalFieldName[]
              ).includes(selectRef.value)),
          );
        } else if (_f.refs) {
          if (isCheckBoxInput(_f.ref)) {
            _f.refs.length > 1
              ? _f.refs.forEach(
                  (checkboxRef) =>
                    (checkboxRef.checked = Array.isArray(fieldValue)
                      ? !!(fieldValue as []).find(
                          (data: string) => data === checkboxRef.value,
                        )
                      : fieldValue === checkboxRef.value),
                )
              : (_f.refs[0].checked = !!fieldValue);
          } else {
            _f.refs.forEach(
              (radioRef: HTMLInputElement) =>
                (radioRef.checked = radioRef.value === fieldValue),
            );
          }
        } else {
          _f.ref.value = fieldValue;
        }

        if (shouldRender) {
          _subjects.control.next({
            values: getValues(),
            name,
          });
        }

        (options.shouldDirty || options.shouldTouch) &&
          updateTouchAndDirtyState(name, fieldValue, options.shouldTouch);
        options.shouldValidate && trigger(name as Path<TFieldValues>);
      }
    }
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

    if (_proxyFormState.isDirty) {
      const previousIsDirty = _formState.isDirty;
      _formState.isDirty = _getIsDirty();
      state.isDirty = _formState.isDirty;
      isChanged = previousIsDirty !== state.isDirty;
    }

    if (_proxyFormState.dirtyFields && !isCurrentTouched) {
      const isPreviousFieldDirty = get(_formState.dirtyFields, name);
      const isCurrentFieldDirty = !deepEqual(
        get(_defaultValues, name),
        inputValue,
      );
      isCurrentFieldDirty
        ? set(_formState.dirtyFields, name, true)
        : unset(_formState.dirtyFields, name);
      state.dirtyFields = _formState.dirtyFields;
      isChanged =
        isChanged || isPreviousFieldDirty !== get(_formState.dirtyFields, name);
    }

    const isPreviousFieldTouched = get(_formState.touchedFields, name);

    if (isCurrentTouched && !isPreviousFieldTouched) {
      set(_formState.touchedFields, name, isCurrentTouched);
      state.touchedFields = _formState.touchedFields;
      isChanged =
        isChanged ||
        (_proxyFormState.touchedFields &&
          isPreviousFieldTouched !== isCurrentTouched);
    }

    isChanged && shouldRender && _subjects.state.next(state);

    return isChanged ? state : {};
  };

  const executeResolver = async (name?: InternalFieldName[]) => {
    return formOptions.resolver
      ? await formOptions.resolver(
          { ..._formValues } as UnpackNestedValue<TFieldValues>,
          formOptions.context,
          getResolverOptions(
            name || _names.mount,
            _fields,
            formOptions.criteriaMode,
            formOptions.shouldUseNativeValidation,
          ),
        )
      : ({} as ResolverResult);
  };

  const executeResolverValidation = async (names?: InternalFieldName[]) => {
    const { errors } = await executeResolver();

    if (names) {
      for (const name of names) {
        const error = get(errors, name);
        error
          ? set(_formState.errors, name, error)
          : unset(_formState.errors, name);
      }
    } else {
      _formState.errors = errors;
    }

    return errors;
  };

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
        const val = omit(field, '_f');

        if (_f) {
          const fieldError = await validateField(
            field,
            get(_formValues, _f.name),
            isValidateAllFieldCriteria,
            formOptions.shouldUseNativeValidation,
          );

          if (shouldCheckValid) {
            if (fieldError[_f.name]) {
              context.valid = false;
              break;
            }
          } else {
            if (fieldError[_f.name]) {
              context.valid = false;
            }
            fieldError[_f.name]
              ? set(_formState.errors, _f.name, fieldError[_f.name])
              : unset(_formState.errors, _f.name);
          }
        }

        val && (await validateForm(val, shouldCheckValid, context));
      }
    }

    return context.valid;
  };

  const handleChange: ChangeHandler = async ({
    type,
    target,
    target: { value, name, type: inputType },
  }) => {
    let error;
    let isValid;
    const field = get(_fields, name) as Field;

    if (field) {
      let inputValue = inputType ? getFieldValue(field) : undefined;
      inputValue = isUndefined(inputValue) ? value : inputValue;

      const isBlurEvent = type === EVENTS.BLUR;
      const { isOnBlur: isReValidateOnBlur, isOnChange: isReValidateOnChange } =
        getValidationModes(formOptions.reValidateMode);

      const shouldSkipValidation =
        (!hasValidation(field._f, field._f.mount) &&
          !formOptions.resolver &&
          !get(_formState.errors, name)) ||
        skipValidation({
          isBlurEvent,
          isTouched: !!get(_formState.touchedFields, name),
          isSubmitted: _formState.isSubmitted,
          isReValidateOnBlur,
          isReValidateOnChange,
          ...validationMode,
        });
      const isWatched =
        !isBlurEvent && isFieldWatched(name as FieldPath<TFieldValues>);

      if (!isUndefined(inputValue)) {
        set(_formValues, name, inputValue);
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
          _subjects.watch.next({
            name,
            type,
          });
        return (
          shouldRender &&
          _subjects.state.next(isWatched ? { name } : { ...fieldState, name })
        );
      }

      _validateCount[name] = _validateCount[name] ? +1 : 1;

      _subjects.state.next({
        isValidating: true,
      });

      if (formOptions.resolver) {
        const { errors } = await executeResolver([name]);
        error = get(errors, name);

        if (isCheckBoxInput(target as Ref) && !error) {
          const parentNodeName = getNodeParentName(name);
          const valError = get(errors, parentNodeName, {});
          valError.type && valError.message && (error = valError);

          if (valError || get(_formState.errors, parentNodeName)) {
            name = parentNodeName;
          }
        }

        isValid = isEmptyObject(errors);
      } else {
        error = (
          await validateField(
            field,
            get(_formValues, name) as Field,
            isValidateAllFieldCriteria,
            formOptions.shouldUseNativeValidation,
          )
        )[name];
      }

      !isBlurEvent &&
        _subjects.watch.next({
          name,
          type,
          values: getValues(),
        });

      shouldRenderBaseOnError(
        false,
        name,
        error,
        fieldState,
        isValid,
        isWatched,
      );
    }
  };

  const _updateValidAndInputValue = (
    name: InternalFieldName,
    ref?: Ref,
    shouldSkipValueAs?: boolean,
  ) => {
    const field = get(_fields, name) as Field;

    if (field) {
      const fieldValue = get(_formValues, name);
      const isValueUndefined = isUndefined(fieldValue);
      const defaultValue = isValueUndefined
        ? get(_defaultValues, name)
        : fieldValue;

      if (
        isUndefined(defaultValue) ||
        (ref && (ref as HTMLInputElement).defaultChecked) ||
        shouldSkipValueAs
      ) {
        set(
          _formValues,
          name,
          shouldSkipValueAs ? defaultValue : getFieldValue(field),
        );
      } else {
        setFieldValue(name, defaultValue);
      }
    }

    _isMounted && _proxyFormState.isValid && _updateValid();
  };

  const _getIsDirty: GetIsDirty = (name, data) => {
    name && data && set(_formValues, name, data);

    return !deepEqual({ ...getValues() }, _defaultValues);
  };

  const _updateValid = async () => {
    const isValid = formOptions.resolver
      ? isEmptyObject((await executeResolver()).errors)
      : await validateForm(_fields, true);

    if (isValid !== _formState.isValid) {
      _formState.isValid = isValid;
      _subjects.state.next({
        isValid,
      });
    }
  };

  const setValues = (
    name: FieldPath<TFieldValues>,
    value: UnpackNestedValue<PathValue<TFieldValues, FieldPath<TFieldValues>>>,
    options: SetValueConfig,
  ) =>
    Object.entries(value).forEach(([fieldKey, fieldValue]) => {
      const fieldName = `${name}.${fieldKey}` as Path<TFieldValues>;
      const field = get(_fields, fieldName);
      const isFieldArray = _names.array.has(name);

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
          );
    });

  const _getWatch: WatchInternal<TFieldValues> = (
    fieldNames,
    defaultValue,
    isGlobal,
  ) => {
    const fieldValues = {
      ...(_isMounted
        ? _formValues
        : isUndefined(defaultValue)
        ? _defaultValues
        : isString(fieldNames)
        ? { [fieldNames]: defaultValue }
        : defaultValue),
    };

    if (!fieldNames) {
      isGlobal && (_names.watchAll = true);
      return fieldValues;
    }

    const result = [];

    for (const fieldName of convertToArrayPayload(fieldNames)) {
      isGlobal && _names.watch.add(fieldName as InternalFieldName);
      result.push(get(fieldValues, fieldName as InternalFieldName));
    }

    return Array.isArray(fieldNames)
      ? result
      : isObject(result[0])
      ? { ...result[0] }
      : Array.isArray(result[0])
      ? [...result[0]]
      : result[0];
  };

  const _updateValues: RegisterMissFields<TFieldValues> = (
    defaultValues,
    name = '',
  ): void => {
    for (const key in defaultValues) {
      const value = defaultValues[key];
      const fieldName = name + (name ? '.' : '') + key;
      const field = get(_fields, fieldName);

      if (!field || !field._f) {
        if (isObject(value) || Array.isArray(value)) {
          _updateValues(value, fieldName);
        } else if (!field) {
          set(_formValues, fieldName, value);
        }
      }
    }
  };

  const _updateFieldArray: BatchFieldArrayUpdate = (
    keyName,
    name,
    method,
    args,
    updatedFieldArrayValuesWithKey = [],
    shouldSet = true,
    shouldSetFields = true,
  ) => {
    let output;
    const updatedFieldArrayValues = omitKeys(
      updatedFieldArrayValuesWithKey,
      keyName,
    );
    _isInAction = true;

    if (shouldSetFields && get(_fields, name)) {
      output = method(get(_fields, name), args.argA, args.argB);
      shouldSet && set(_fields, name, output);
    }

    output = method(get(_formValues, name), args.argA, args.argB);
    shouldSet && set(_formValues, name, output);

    if (Array.isArray(get(_formState.errors, name))) {
      const output = method(get(_formState.errors, name), args.argA, args.argB);
      shouldSet && set(_formState.errors, name, output);
      unsetEmptyArray(_formState.errors, name);
    }

    if (_proxyFormState.touchedFields && get(_formState.touchedFields, name)) {
      const output = method(
        get(_formState.touchedFields, name),
        args.argA,
        args.argB,
      );
      shouldSet && set(_formState.touchedFields, name, output);
      unsetEmptyArray(_formState.touchedFields, name);
    }

    if (_proxyFormState.dirtyFields || _proxyFormState.isDirty) {
      set(
        _formState.dirtyFields,
        name,
        setFieldArrayDirtyFields(
          omitKey(updatedFieldArrayValues, keyName),
          get(_defaultValues, name, []),
          get(_formState.dirtyFields, name, []),
        ),
      );
      updatedFieldArrayValues &&
        set(
          _formState.dirtyFields,
          name,
          setFieldArrayDirtyFields(
            omitKey(updatedFieldArrayValues, keyName),
            get(_defaultValues, name, []),
            get(_formState.dirtyFields, name, []),
          ),
        );
      unsetEmptyArray(_formState.dirtyFields, name);
    }

    _subjects.state.next({
      isDirty: _getIsDirty(name, omitKey(updatedFieldArrayValues, keyName)),
      dirtyFields: _formState.dirtyFields,
      errors: _formState.errors,
      isValid: _formState.isValid,
    });
  };

  const _getFieldArrayValue = (name: InternalFieldName) =>
    get(_isMounted ? _formValues : _defaultValues, name, []);

  const setValue: UseFormSetValue<TFieldValues> = (
    name,
    value,
    options = {},
  ) => {
    const field = get(_fields, name);
    const isFieldArray = _names.array.has(name);

    set(_formValues, name, value);

    if (isFieldArray) {
      _subjects.array.next({
        name,
        values: _formValues,
      });

      if (
        (_proxyFormState.isDirty || _proxyFormState.dirtyFields) &&
        options.shouldDirty
      ) {
        set(
          _formState.dirtyFields,
          name,
          setFieldArrayDirtyFields(
            value,
            get(_defaultValues, name, []),
            get(_formState.dirtyFields, name, []),
          ),
        );

        _subjects.state.next({
          name,
          dirtyFields: _formState.dirtyFields,
          isDirty: _getIsDirty(name, value),
        });
      }
    } else {
      field && !field._f && !isNullOrUndefined(value)
        ? setValues(name, value, options)
        : setFieldValue(name, value, options, true);
    }

    isFieldWatched(name) && _subjects.state.next({});
    _subjects.watch.next({
      name,
    });
  };

  const trigger: UseFormTrigger<TFieldValues> = async (name, options = {}) => {
    const fieldNames = convertToArrayPayload(name) as InternalFieldName[];
    let isValid;

    _subjects.state.next({
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
            fieldNames.map(async (fieldName) => {
              const field = get(_fields, fieldName);
              return await validateForm(
                field._f ? { [fieldName]: field } : field,
              );
            }),
          )
        ).every(Boolean);
      } else {
        await validateForm(_fields);
        isValid = isEmptyObject(_formState.errors);
      }
    }

    _subjects.state.next({
      ...(isString(name) ? { name } : {}),
      errors: _formState.errors,
      isValidating: false,
    });

    if (options.shouldFocus && !isValid) {
      focusFieldBy(
        _fields,
        (key) => get(_formState.errors, key),
        name ? fieldNames : _names.mount,
      );
    }

    _proxyFormState.isValid && _updateValid();

    return isValid;
  };

  const getValues: UseFormGetValues<TFieldValues> = (
    fieldNames?:
      | FieldPath<TFieldValues>
      | ReadonlyArray<FieldPath<TFieldValues>>,
  ) => {
    const values = {
      ..._defaultValues,
      ..._formValues,
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
          unset(_formState.errors, inputName),
        )
      : (_formState.errors = {});

    _subjects.state.next({
      errors: _formState.errors,
    });
  };

  const setError: UseFormSetError<TFieldValues> = (name, error, options) => {
    const ref = ((get(_fields, name, { _f: {} }) as Field)._f || {}).ref;

    set(_formState.errors, name, {
      ...error,
      ref,
    });

    _subjects.state.next({
      name,
      errors: _formState.errors,
      isValid: false,
    });

    options && options.shouldFocus && ref && ref.focus && ref.focus();
  };

  const watch: UseFormWatch<TFieldValues> = (
    fieldName?:
      | FieldPath<TFieldValues>
      | ReadonlyArray<FieldPath<TFieldValues>>
      | WatchObserver<TFieldValues>,
    defaultValue?: unknown,
  ) =>
    isFunction(fieldName)
      ? _subjects.watch.subscribe({
          next: (info: any) =>
            fieldName(
              _getWatch(
                undefined,
                defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>,
              ) as UnpackNestedValue<TFieldValues>,
              info,
            ),
        })
      : _getWatch(
          fieldName as InternalFieldName | InternalFieldName[],
          defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>,
          true,
        );

  const unregister: UseFormUnregister<TFieldValues> = (name, options = {}) => {
    for (const inputName of name ? convertToArrayPayload(name) : _names.mount) {
      _names.mount.delete(inputName);
      _names.array.delete(inputName);

      if (get(_fields, inputName) as Field) {
        if (!options.keepValue) {
          unset(_fields, inputName);
          unset(_formValues, inputName);
        }

        !options.keepError && unset(_formState.errors, inputName);
        !options.keepDirty && unset(_formState.dirtyFields, inputName);
        !options.keepTouched && unset(_formState.touchedFields, inputName);
        !formOptions.shouldUnregister &&
          !options.keepDefaultValue &&
          unset(_defaultValues, inputName);
      }
    }

    _subjects.watch.next({});

    _subjects.state.next({
      ..._formState,
      ...(!options.keepDirty ? {} : { isDirty: _getIsDirty() }),
    });
    !options.keepIsValid && _updateValid();
  };

  const registerFieldRef = (
    name: InternalFieldName,
    fieldRef: HTMLInputElement,
    options?: RegisterOptions,
  ): ((name: InternalFieldName) => void) | void => {
    register(name as FieldPath<TFieldValues>, options);
    let field: Field = get(_fields, name);
    const ref = isUndefined(fieldRef.value)
      ? fieldRef.querySelectorAll
        ? (fieldRef.querySelectorAll('input,select,textarea')[0] as Ref) ||
          fieldRef
        : fieldRef
      : fieldRef;

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

    set(_fields, name, field);

    _updateValidAndInputValue(name, ref);
  };

  const register: UseFormRegister<TFieldValues> = (name, options = {}) => {
    const field = get(_fields, name);

    set(_fields, name, {
      _f: {
        ...(field && field._f ? field._f : { ref: { name } }),
        name,
        mount: true,
        ...options,
      },
    });

    if (options.value) {
      set(_formValues, name, options.value);
    }

    if (
      !isUndefined(options.disabled) &&
      field &&
      field._f &&
      field._f.ref.disabled !== options.disabled
    ) {
      set(_formValues, name, options.disabled ? undefined : field._f.ref.value);
    }

    _names.mount.add(name);
    !field && _updateValidAndInputValue(name, undefined, true);

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
              const field = get(_fields, name, {}) as Field;
              const _shouldUnregister =
                formOptions.shouldUnregister || options.shouldUnregister;

              if (field._f) {
                field._f.mount = false;
              }

              _shouldUnregister &&
                !(isNameInFieldArray(_names.array, name) && _isInAction) &&
                _names.unMount.add(name);
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
      let fieldValues: any = { ..._formValues };

      _subjects.state.next({
        isSubmitting: true,
      });

      try {
        if (formOptions.resolver) {
          const { errors, values } = await executeResolver();
          _formState.errors = errors;
          fieldValues = values;
        } else {
          await validateForm(_fields);
        }

        if (
          isEmptyObject(_formState.errors) &&
          Object.keys(_formState.errors).every((name) => get(fieldValues, name))
        ) {
          _subjects.state.next({
            errors: {},
            isSubmitting: true,
          });
          await onValid(fieldValues, e);
        } else {
          onInvalid && (await onInvalid(_formState.errors, e));
          formOptions.shouldFocusError &&
            focusFieldBy(
              _fields,
              (key) => get(_formState.errors, key),
              _names.mount,
            );
        }
      } catch (err) {
        hasNoPromiseError = false;
        throw err;
      } finally {
        _formState.isSubmitted = true;
        _subjects.state.next({
          isSubmitted: true,
          isSubmitting: false,
          isSubmitSuccessful:
            isEmptyObject(_formState.errors) && hasNoPromiseError,
          submitCount: _formState.submitCount + 1,
          errors: _formState.errors,
        });
      }
    };

  const reset: UseFormReset<TFieldValues> = (
    formValues,
    keepStateOptions = {},
  ) => {
    const updatedValues = formValues || _defaultValues;
    const values = cloneObject(updatedValues);

    _formValues = values;

    if (isWeb && !keepStateOptions.keepValues) {
      for (const name of _names.mount) {
        const field = get(_fields, name);
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
      _defaultValues = { ...updatedValues };
    }

    if (!keepStateOptions.keepValues) {
      _fields = {};

      _subjects.control.next({
        values: keepStateOptions.keepDefaultValues
          ? _defaultValues
          : { ...updatedValues },
      });

      _subjects.watch.next({});

      _subjects.array.next({
        values,
      });
    }

    _names = {
      mount: new Set(),
      unMount: new Set(),
      array: new Set(),
      watch: new Set(),
      watchAll: false,
      focus: '',
    };

    _subjects.state.next({
      submitCount: keepStateOptions.keepSubmitCount
        ? _formState.submitCount
        : 0,
      isDirty: keepStateOptions.keepDirty
        ? _formState.isDirty
        : keepStateOptions.keepDefaultValues
        ? deepEqual(formValues, _defaultValues)
        : false,
      isSubmitted: keepStateOptions.keepIsSubmitted
        ? _formState.isSubmitted
        : false,
      dirtyFields: keepStateOptions.keepDirty ? _formState.dirtyFields : {},
      touchedFields: keepStateOptions.keepTouched
        ? _formState.touchedFields
        : {},
      errors: keepStateOptions.keepErrors ? _formState.errors : {},
      isSubmitting: false,
      isSubmitSuccessful: false,
    });

    _isMounted = !!keepStateOptions.keepIsValid;
  };

  const setFocus: UseFormSetFocus<TFieldValues> = (name) =>
    get(_fields, name)._f.ref.focus();

  const _removeFields = () => {
    for (const name of _names.unMount) {
      const field = get(_fields, name) as Field;

      field &&
        (field._f.refs ? field._f.refs.every(live) : live(field._f.ref)) &&
        unregister(name as FieldPath<TFieldValues>);
    }

    _names.unMount = new Set();
  };

  return {
    control: {
      register,
      unregister,
      _getWatch,
      _getIsDirty,
      _updateValid,
      _updateValues,
      _removeFields,
      _updateFieldArray,
      _getFieldArrayValue,
      _subjects,
      _shouldUnregister: formOptions.shouldUnregister,
      _fields,
      _proxyFormState,
      get _formValues() {
        return _formValues;
      },
      set _formValues(value) {
        _formValues = value;
      },
      get _isMounted() {
        return _isMounted;
      },
      set _isMounted(value) {
        _isMounted = value;
      },
      get _defaultValues() {
        return _defaultValues;
      },
      set _defaultValues(value) {
        _defaultValues = value;
      },
      get _names() {
        return _names;
      },
      set _names(value) {
        _names = value;
      },
      _isInAction: {
        get val() {
          return _isInAction;
        },
        set val(value) {
          _isInAction = value;
        },
      },
      _formState: {
        get val() {
          return _formState;
        },
        set val(value) {
          _formState = value;
        },
      },
      _updateProps: (options) => {
        formOptions = { ...defaultOptions, ...options };
      },
    },
    trigger,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    clearErrors,
    unregister,
    setError,
    setFocus,
  };
}
