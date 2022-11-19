import { EVENTS, VALIDATION_MODE } from '../constants';
import {
  BatchFieldArrayUpdate,
  ChangeHandler,
  DeepPartial,
  DelayCallback,
  EventType,
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
  Ref,
  ResolverResult,
  SetFieldValue,
  SetValueConfig,
  Subjects,
  UseFormClearErrors,
  UseFormGetFieldState,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormProps,
  UseFormRegister,
  UseFormReset,
  UseFormResetField,
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
import cloneObject from '../utils/cloneObject';
import compact from '../utils/compact';
import convertToArrayPayload from '../utils/convertToArrayPayload';
import createSubject from '../utils/createSubject';
import deepEqual from '../utils/deepEqual';
import get from '../utils/get';
import getValidationModes from '../utils/getValidationModes';
import isBoolean from '../utils/isBoolean';
import isCheckBoxInput from '../utils/isCheckBoxInput';
import isDateObject from '../utils/isDateObject';
import isEmptyObject from '../utils/isEmptyObject';
import isFileInput from '../utils/isFileInput';
import isFunction from '../utils/isFunction';
import isHTMLElement from '../utils/isHTMLElement';
import isMultipleSelect from '../utils/isMultipleSelect';
import isNullOrUndefined from '../utils/isNullOrUndefined';
import isPrimitive from '../utils/isPrimitive';
import isRadioOrCheckbox from '../utils/isRadioOrCheckbox';
import isString from '../utils/isString';
import isUndefined from '../utils/isUndefined';
import isWeb from '../utils/isWeb';
import live from '../utils/live';
import set from '../utils/set';
import unset from '../utils/unset';

import focusFieldBy from './focusFieldBy';
import generateWatchOutput from './generateWatchOutput';
import getDirtyFields from './getDirtyFields';
import getEventValue from './getEventValue';
import getFieldValue from './getFieldValue';
import getFieldValueAs from './getFieldValueAs';
import getResolverOptions from './getResolverOptions';
import getRuleValue from './getRuleValue';
import hasValidation from './hasValidation';
import isNameInFieldArray from './isNameInFieldArray';
import isWatched from './isWatched';
import schemaErrorLookup from './schemaErrorLookup';
import skipValidation from './skipValidation';
import unsetEmptyArray from './unsetEmptyArray';
import updateFieldArrayRootError from './updateFieldArrayRootError';
import validateField from './validateField';

const defaultOptions = {
  mode: VALIDATION_MODE.onSubmit,
  reValidateMode: VALIDATION_MODE.onChange,
  shouldFocusError: true,
} as const;

export function createFormControl<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
>(
  props: UseFormProps<TFieldValues, TContext> = {},
): Omit<UseFormReturn<TFieldValues, TContext>, 'formState'> {
  let _options = {
    ...defaultOptions,
    ...props,
  };
  let _formState: FormState<TFieldValues> = {
    submitCount: 0,
    isDirty: false,
    isValidating: false,
    isSubmitted: false,
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    touchedFields: {},
    dirtyFields: {},
    errors: {},
  };
  let _fields = {};
  let _defaultValues = cloneObject(_options.defaultValues) || {};
  let _formValues = _options.shouldUnregister
    ? {}
    : cloneObject(_defaultValues);
  let _stateFlags = {
    action: false,
    mount: false,
    watch: false,
  };
  let _names: Names = {
    mount: new Set(),
    unMount: new Set(),
    array: new Set(),
    watch: new Set(),
  } as Names;
  let delayErrorCallback: DelayCallback | null;
  let timer = 0;
  let validateFields: Record<InternalFieldName, number> = {};
  const _proxyFormState = {
    isDirty: false,
    dirtyFields: false,
    touchedFields: false,
    isValidating: false,
    isValid: false,
    errors: false,
  };
  const _subjects: Subjects<TFieldValues> = {
    watch: createSubject(),
    array: createSubject(),
    state: createSubject(),
  };

  const validationModeBeforeSubmit = getValidationModes(_options.mode);
  const validationModeAfterSubmit = getValidationModes(_options.reValidateMode);
  const shouldDisplayAllAssociatedErrors =
    _options.criteriaMode === VALIDATION_MODE.all;

  const debounce =
    <T extends Function>(callback: T) =>
    (wait: number) => {
      clearTimeout(timer);
      timer = window.setTimeout(callback, wait);
    };

  const _updateValid = async () => {
    let isValid = false;

    if (_proxyFormState.isValid) {
      isValid = _options.resolver
        ? isEmptyObject((await _executeSchema()).errors)
        : await executeBuiltInValidation(_fields, true);

      if (isValid !== _formState.isValid) {
        _formState.isValid = isValid;
        _subjects.state.next({
          isValid,
        });
      }
    }

    return isValid;
  };

  const _updateFieldArray: BatchFieldArrayUpdate = (
    name,
    values = [],
    method,
    args,
    shouldSetValues = true,
    shouldUpdateFieldsAndState = true,
  ) => {
    if (args && method) {
      _stateFlags.action = true;
      if (shouldUpdateFieldsAndState && Array.isArray(get(_fields, name))) {
        const fieldValues = method(get(_fields, name), args.argA, args.argB);
        shouldSetValues && set(_fields, name, fieldValues);
      }

      if (
        shouldUpdateFieldsAndState &&
        Array.isArray(get(_formState.errors, name))
      ) {
        const errors = method(
          get(_formState.errors, name),
          args.argA,
          args.argB,
        );
        shouldSetValues && set(_formState.errors, name, errors);
        unsetEmptyArray(_formState.errors, name);
      }

      if (
        _proxyFormState.touchedFields &&
        shouldUpdateFieldsAndState &&
        Array.isArray(get(_formState.touchedFields, name))
      ) {
        const touchedFields = method(
          get(_formState.touchedFields, name),
          args.argA,
          args.argB,
        );
        shouldSetValues && set(_formState.touchedFields, name, touchedFields);
      }

      if (_proxyFormState.dirtyFields) {
        _formState.dirtyFields = getDirtyFields(_defaultValues, _formValues);
      }

      _subjects.state.next({
        isDirty: _getDirty(name, values),
        dirtyFields: _formState.dirtyFields,
        errors: _formState.errors,
        isValid: _formState.isValid,
      });
    } else {
      set(_formValues, name, values);
    }
  };

  const updateErrors = (name: InternalFieldName, error: FieldError) => {
    set(_formState.errors, name, error);
    _subjects.state.next({
      errors: _formState.errors,
    });
  };

  const updateValidAndValue = (
    name: InternalFieldName,
    shouldSkipSetValueAs: boolean,
    value?: unknown,
    ref?: Ref,
  ) => {
    const field: Field = get(_fields, name);

    if (field) {
      const defaultValue = get(
        _formValues,
        name,
        isUndefined(value) ? get(_defaultValues, name) : value,
      );

      isUndefined(defaultValue) ||
      (ref && (ref as HTMLInputElement).defaultChecked) ||
      shouldSkipSetValueAs
        ? set(
            _formValues,
            name,
            shouldSkipSetValueAs ? defaultValue : getFieldValue(field._f),
          )
        : setFieldValue(name, defaultValue);

      _stateFlags.mount && _updateValid();
    }
  };

  const updateTouchAndDirty = (
    name: InternalFieldName,
    fieldValue: unknown,
    isBlurEvent?: boolean,
    shouldDirty?: boolean,
    shouldRender?: boolean,
  ): Partial<
    Pick<FormState<TFieldValues>, 'dirtyFields' | 'isDirty' | 'touchedFields'>
  > => {
    let shouldUpdateField = false;
    let isPreviousDirty = false;
    const output: Partial<FormState<TFieldValues>> & { name: string } = {
      name,
    };

    if (_proxyFormState.isDirty) {
      isPreviousDirty = _formState.isDirty;
      _formState.isDirty = output.isDirty = _getDirty();
      shouldUpdateField = isPreviousDirty !== output.isDirty;
    }

    if (_proxyFormState.dirtyFields && (!isBlurEvent || shouldDirty)) {
      isPreviousDirty = get(_formState.dirtyFields, name);
      const isCurrentFieldPristine = deepEqual(
        get(_defaultValues, name),
        fieldValue,
      );
      isCurrentFieldPristine
        ? unset(_formState.dirtyFields, name)
        : set(_formState.dirtyFields, name, true);
      output.dirtyFields = _formState.dirtyFields;
      shouldUpdateField =
        shouldUpdateField || isPreviousDirty !== !isCurrentFieldPristine;
    }

    if (isBlurEvent) {
      const isPreviousFieldTouched = get(_formState.touchedFields, name);

      if (!isPreviousFieldTouched) {
        set(_formState.touchedFields, name, isBlurEvent);
        output.touchedFields = _formState.touchedFields;
        shouldUpdateField =
          shouldUpdateField ||
          (_proxyFormState.touchedFields &&
            isPreviousFieldTouched !== isBlurEvent);
      }
    }

    shouldUpdateField && shouldRender && _subjects.state.next(output);

    return shouldUpdateField ? output : {};
  };

  const shouldRenderByError = (
    name: InternalFieldName,
    isValid?: boolean,
    error?: FieldError,
    fieldState?: {
      dirty?: FieldNamesMarkedBoolean<TFieldValues>;
      isDirty?: boolean;
      touched?: FieldNamesMarkedBoolean<TFieldValues>;
    },
  ) => {
    const previousFieldError = get(_formState.errors, name);
    const shouldUpdateValid =
      _proxyFormState.isValid &&
      isBoolean(isValid) &&
      _formState.isValid !== isValid;

    if (props.delayError && error) {
      delayErrorCallback = debounce(() => updateErrors(name, error));
      delayErrorCallback(props.delayError);
    } else {
      clearTimeout(timer);
      delayErrorCallback = null;
      error
        ? set(_formState.errors, name, error)
        : unset(_formState.errors, name);
    }

    if (
      (error ? !deepEqual(previousFieldError, error) : previousFieldError) ||
      !isEmptyObject(fieldState) ||
      shouldUpdateValid
    ) {
      const updatedFormState = {
        ...fieldState,
        ...(shouldUpdateValid && isBoolean(isValid) ? { isValid } : {}),
        errors: _formState.errors,
        name,
      };

      _formState = {
        ..._formState,
        ...updatedFormState,
      };

      _subjects.state.next(updatedFormState);
    }

    validateFields[name]--;

    if (
      _proxyFormState.isValidating &&
      !Object.values(validateFields).some((v) => v)
    ) {
      _subjects.state.next({
        isValidating: false,
      });
      validateFields = {};
    }
  };

  const _executeSchema = async (name?: InternalFieldName[]) =>
    _options.resolver
      ? await _options.resolver(
          { ..._formValues } as TFieldValues,
          _options.context,
          getResolverOptions(
            name || _names.mount,
            _fields,
            _options.criteriaMode,
            _options.shouldUseNativeValidation,
          ),
        )
      : ({} as ResolverResult<TFieldValues>);

  const executeSchemaAndUpdateState = async (names?: InternalFieldName[]) => {
    const { errors } = await _executeSchema();

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

  const executeBuiltInValidation = async (
    fields: FieldRefs,
    shouldOnlyCheckValid?: boolean,
    context = {
      valid: true,
    },
  ) => {
    for (const name in fields) {
      const field = fields[name];

      if (field) {
        const { _f, ...fieldValue } = field;

        if (_f) {
          const isFieldArrayRoot = _names.array.has(_f.name);
          const fieldError = await validateField(
            field,
            get(_formValues, _f.name),
            shouldDisplayAllAssociatedErrors,
            _options.shouldUseNativeValidation,
            isFieldArrayRoot,
          );

          if (fieldError[_f.name]) {
            context.valid = false;

            if (shouldOnlyCheckValid) {
              break;
            }
          }

          !shouldOnlyCheckValid &&
            (get(fieldError, _f.name)
              ? isFieldArrayRoot
                ? updateFieldArrayRootError(
                    _formState.errors,
                    fieldError,
                    _f.name,
                  )
                : set(_formState.errors, _f.name, fieldError[_f.name])
              : unset(_formState.errors, _f.name));
        }

        fieldValue &&
          (await executeBuiltInValidation(
            fieldValue,
            shouldOnlyCheckValid,
            context,
          ));
      }
    }

    return context.valid;
  };

  const _removeUnmounted = () => {
    for (const name of _names.unMount) {
      const field: Field = get(_fields, name);

      field &&
        (field._f.refs
          ? field._f.refs.every((ref) => !live(ref))
          : !live(field._f.ref)) &&
        unregister(name as FieldPath<TFieldValues>);
    }

    _names.unMount = new Set();
  };

  const _getDirty: GetIsDirty = (name, data) => (
    name && data && set(_formValues, name, data),
    !deepEqual(getValues(), _defaultValues)
  );

  const _getWatch: WatchInternal<TFieldValues> = (
    names,
    defaultValue,
    isGlobal,
  ) =>
    generateWatchOutput(
      names,
      _names,
      {
        ...(_stateFlags.mount
          ? _formValues
          : isUndefined(defaultValue)
          ? _defaultValues
          : isString(names)
          ? { [names]: defaultValue }
          : defaultValue),
      },
      isGlobal,
    );

  const _getFieldArray = <TFieldArrayValues>(
    name: InternalFieldName,
  ): Partial<TFieldArrayValues>[] =>
    compact(
      get(
        _stateFlags.mount ? _formValues : _defaultValues,
        name,
        props.shouldUnregister ? get(_defaultValues, name, []) : [],
      ),
    );

  const setFieldValue = (
    name: InternalFieldName,
    value: SetFieldValue<TFieldValues>,
    options: SetValueConfig = {},
  ) => {
    const field: Field = get(_fields, name);
    let fieldValue: unknown = value;

    if (field) {
      const fieldReference = field._f;

      if (fieldReference) {
        !fieldReference.disabled &&
          set(_formValues, name, getFieldValueAs(value, fieldReference));

        fieldValue =
          isWeb && isHTMLElement(fieldReference.ref) && isNullOrUndefined(value)
            ? ''
            : value;

        if (isMultipleSelect(fieldReference.ref)) {
          [...fieldReference.ref.options].forEach(
            (optionRef) =>
              (optionRef.selected = (
                fieldValue as InternalFieldName[]
              ).includes(optionRef.value)),
          );
        } else if (fieldReference.refs) {
          if (isCheckBoxInput(fieldReference.ref)) {
            fieldReference.refs.length > 1
              ? fieldReference.refs.forEach(
                  (checkboxRef) =>
                    (!checkboxRef.defaultChecked || !checkboxRef.disabled) &&
                    (checkboxRef.checked = Array.isArray(fieldValue)
                      ? !!(fieldValue as []).find(
                          (data: string) => data === checkboxRef.value,
                        )
                      : fieldValue === checkboxRef.value),
                )
              : fieldReference.refs[0] &&
                (fieldReference.refs[0].checked = !!fieldValue);
          } else {
            fieldReference.refs.forEach(
              (radioRef: HTMLInputElement) =>
                (radioRef.checked = radioRef.value === fieldValue),
            );
          }
        } else if (isFileInput(fieldReference.ref)) {
          fieldReference.ref.value = '';
        } else {
          fieldReference.ref.value = fieldValue;

          if (!fieldReference.ref.type) {
            _subjects.watch.next({
              name,
            });
          }
        }
      }
    }

    (options.shouldDirty || options.shouldTouch) &&
      updateTouchAndDirty(
        name,
        fieldValue,
        options.shouldTouch,
        options.shouldDirty,
        true,
      );

    options.shouldValidate && trigger(name as Path<TFieldValues>);
  };

  const setValues = <
    T extends InternalFieldName,
    K extends SetFieldValue<TFieldValues>,
    U extends SetValueConfig,
  >(
    name: T,
    value: K,
    options: U,
  ) => {
    for (const fieldKey in value) {
      const fieldValue = value[fieldKey];
      const fieldName = `${name}.${fieldKey}` as Path<TFieldValues>;
      const field = get(_fields, fieldName);

      (_names.array.has(name) ||
        !isPrimitive(fieldValue) ||
        (field && !field._f)) &&
      !isDateObject(fieldValue)
        ? setValues(fieldName, fieldValue, options)
        : setFieldValue(fieldName, fieldValue, options);
    }
  };

  const setValue: UseFormSetValue<TFieldValues> = (
    name,
    value,
    options = {},
  ) => {
    const field = get(_fields, name);
    const isFieldArray = _names.array.has(name);
    const cloneValue = cloneObject(value);

    set(_formValues, name, cloneValue);

    if (isFieldArray) {
      _subjects.array.next({
        name,
        values: _formValues,
      });

      if (
        (_proxyFormState.isDirty || _proxyFormState.dirtyFields) &&
        options.shouldDirty
      ) {
        _formState.dirtyFields = getDirtyFields(_defaultValues, _formValues);

        _subjects.state.next({
          name,
          dirtyFields: _formState.dirtyFields,
          isDirty: _getDirty(name, cloneValue),
        });
      }
    } else {
      field && !field._f && !isNullOrUndefined(cloneValue)
        ? setValues(name, cloneValue, options)
        : setFieldValue(name, cloneValue, options);
    }

    isWatched(name, _names) && _subjects.state.next({});
    _subjects.watch.next({
      name,
    });
  };

  const onChange: ChangeHandler = async (event) => {
    const target = event.target;
    let name = target.name;
    const field: Field = get(_fields, name);

    if (field) {
      let error;
      let isValid;
      const fieldValue = target.type
        ? getFieldValue(field._f)
        : getEventValue(event);
      const isBlurEvent =
        event.type === EVENTS.BLUR || event.type === EVENTS.FOCUS_OUT;
      const shouldSkipValidation =
        (!hasValidation(field._f) &&
          !_options.resolver &&
          !get(_formState.errors, name) &&
          !field._f.deps) ||
        skipValidation(
          isBlurEvent,
          get(_formState.touchedFields, name),
          _formState.isSubmitted,
          validationModeAfterSubmit,
          validationModeBeforeSubmit,
        );
      const watched = isWatched(name, _names, isBlurEvent);

      set(_formValues, name, fieldValue);

      if (isBlurEvent) {
        field._f.onBlur && field._f.onBlur(event);
        delayErrorCallback && delayErrorCallback(0);
      } else if (field._f.onChange) {
        field._f.onChange(event);
      }

      const fieldState = updateTouchAndDirty(
        name,
        fieldValue,
        isBlurEvent,
        false,
      );

      const shouldRender = !isEmptyObject(fieldState) || watched;

      !isBlurEvent &&
        _subjects.watch.next({
          name,
          type: event.type,
        });

      if (shouldSkipValidation) {
        _proxyFormState.isValid && _updateValid();

        return (
          shouldRender &&
          _subjects.state.next({ name, ...(watched ? {} : fieldState) })
        );
      }

      !isBlurEvent && watched && _subjects.state.next({});

      validateFields[name] = validateFields[name]
        ? validateFields[name] + 1
        : 1;

      _subjects.state.next({
        isValidating: true,
      });

      if (_options.resolver) {
        const { errors } = await _executeSchema([name]);
        const previousErrorLookupResult = schemaErrorLookup(
          _formState.errors,
          _fields,
          name,
        );
        const errorLookupResult = schemaErrorLookup(
          errors,
          _fields,
          previousErrorLookupResult.name || name,
        );

        error = errorLookupResult.error;
        name = errorLookupResult.name;

        isValid = isEmptyObject(errors);
      } else {
        error = (
          await validateField(
            field,
            get(_formValues, name),
            shouldDisplayAllAssociatedErrors,
            _options.shouldUseNativeValidation,
          )
        )[name];

        _updateValid();
      }

      field._f.deps &&
        trigger(
          field._f.deps as FieldPath<TFieldValues> | FieldPath<TFieldValues>[],
        );

      shouldRenderByError(name, isValid, error, fieldState);
    }
  };

  const trigger: UseFormTrigger<TFieldValues> = async (name, options = {}) => {
    let isValid;
    let validationResult;
    const fieldNames = convertToArrayPayload(name) as InternalFieldName[];

    _subjects.state.next({
      isValidating: true,
    });

    if (_options.resolver) {
      const errors = await executeSchemaAndUpdateState(
        isUndefined(name) ? name : fieldNames,
      );

      isValid = isEmptyObject(errors);
      validationResult = name
        ? !fieldNames.some((name) => get(errors, name))
        : isValid;
    } else if (name) {
      validationResult = (
        await Promise.all(
          fieldNames.map(async (fieldName) => {
            const field = get(_fields, fieldName);
            return await executeBuiltInValidation(
              field && field._f ? { [fieldName]: field } : field,
            );
          }),
        )
      ).every(Boolean);
      !(!validationResult && !_formState.isValid) && _updateValid();
    } else {
      validationResult = isValid = await executeBuiltInValidation(_fields);
    }

    _subjects.state.next({
      ...(!isString(name) ||
      (_proxyFormState.isValid && isValid !== _formState.isValid)
        ? {}
        : { name }),
      ...(_options.resolver || !name ? { isValid } : {}),
      errors: _formState.errors,
      isValidating: false,
    });

    options.shouldFocus &&
      !validationResult &&
      focusFieldBy(
        _fields,
        (key) => key && get(_formState.errors, key),
        name ? fieldNames : _names.mount,
      );

    return validationResult;
  };

  const getValues: UseFormGetValues<TFieldValues> = (
    fieldNames?:
      | FieldPath<TFieldValues>
      | ReadonlyArray<FieldPath<TFieldValues>>,
  ) => {
    const values = {
      ..._defaultValues,
      ...(_stateFlags.mount ? _formValues : {}),
    };

    return isUndefined(fieldNames)
      ? values
      : isString(fieldNames)
      ? get(values, fieldNames as InternalFieldName)
      : fieldNames.map((name) => get(values, name as InternalFieldName));
  };

  const getFieldState: UseFormGetFieldState<TFieldValues> = (
    name,
    formState,
  ) => ({
    invalid: !!get((formState || _formState).errors, name),
    isDirty: !!get((formState || _formState).dirtyFields, name),
    isTouched: !!get((formState || _formState).touchedFields, name),
    error: get((formState || _formState).errors, name),
  });

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
    name?:
      | FieldPath<TFieldValues>
      | ReadonlyArray<FieldPath<TFieldValues>>
      | WatchObserver<TFieldValues>,
    defaultValue?: unknown,
  ) =>
    isFunction(name)
      ? _subjects.watch.subscribe({
          next: (info) =>
            name(
              _getWatch(undefined, defaultValue as DeepPartial<TFieldValues>),
              info as {
                name?: FieldPath<TFieldValues>;
                type?: EventType;
                value?: unknown;
              },
            ),
        })
      : _getWatch(
          name as InternalFieldName | InternalFieldName[],
          defaultValue as DeepPartial<TFieldValues>,
          true,
        );

  const unregister: UseFormUnregister<TFieldValues> = (name, options = {}) => {
    for (const fieldName of name ? convertToArrayPayload(name) : _names.mount) {
      _names.mount.delete(fieldName);
      _names.array.delete(fieldName);

      if (get(_fields, fieldName)) {
        if (!options.keepValue) {
          unset(_fields, fieldName);
          unset(_formValues, fieldName);
        }

        !options.keepError && unset(_formState.errors, fieldName);
        !options.keepDirty && unset(_formState.dirtyFields, fieldName);
        !options.keepTouched && unset(_formState.touchedFields, fieldName);
        !_options.shouldUnregister &&
          !options.keepDefaultValue &&
          unset(_defaultValues, fieldName);
      }
    }

    _subjects.watch.next({});

    _subjects.state.next({
      ..._formState,
      ...(!options.keepDirty ? {} : { isDirty: _getDirty() }),
    });

    !options.keepIsValid && _updateValid();
  };

  const register: UseFormRegister<TFieldValues> = (name, options = {}) => {
    let field = get(_fields, name);
    const disabledIsDefined = isBoolean(options.disabled);

    set(_fields, name, {
      ...(field || {}),
      _f: {
        ...(field && field._f ? field._f : { ref: { name } }),
        name,
        mount: true,
        ...options,
      },
    });
    _names.mount.add(name);

    field
      ? disabledIsDefined &&
        set(
          _formValues,
          name,
          options.disabled
            ? undefined
            : get(_formValues, name, getFieldValue(field._f)),
        )
      : updateValidAndValue(name, true, options.value);

    return {
      ...(disabledIsDefined ? { disabled: options.disabled } : {}),
      ...(_options.shouldUseNativeValidation
        ? {
            required: !!options.required,
            min: getRuleValue(options.min),
            max: getRuleValue(options.max),
            minLength: getRuleValue<number>(options.minLength) as number,
            maxLength: getRuleValue(options.maxLength) as number,
            pattern: getRuleValue(options.pattern) as string,
          }
        : {}),
      name,
      onChange,
      onBlur: onChange,
      ref: (ref: HTMLInputElement | null): void => {
        if (ref) {
          register(name, options);
          field = get(_fields, name);

          const fieldRef = isUndefined(ref.value)
            ? ref.querySelectorAll
              ? (ref.querySelectorAll('input,select,textarea')[0] as Ref) || ref
              : ref
            : ref;
          const radioOrCheckbox = isRadioOrCheckbox(fieldRef);
          const refs = field._f.refs || [];

          if (
            radioOrCheckbox
              ? refs.find((option: Ref) => option === fieldRef)
              : fieldRef === field._f.ref
          ) {
            return;
          }

          set(_fields, name, {
            _f: {
              ...field._f,
              ...(radioOrCheckbox
                ? {
                    refs: [
                      ...refs.filter(live),
                      fieldRef,
                      ...(!!Array.isArray(get(_defaultValues, name))
                        ? [{}]
                        : []),
                    ],
                    ref: { type: fieldRef.type, name },
                  }
                : { ref: fieldRef }),
            },
          });

          updateValidAndValue(name, false, undefined, fieldRef);
        } else {
          field = get(_fields, name, {});

          if (field._f) {
            field._f.mount = false;
          }

          (_options.shouldUnregister || options.shouldUnregister) &&
            !(isNameInFieldArray(_names.array, name) && _stateFlags.action) &&
            _names.unMount.add(name);
        }
      },
    };
  };

  const _focusError = () =>
    _options.shouldFocusError &&
    focusFieldBy(
      _fields,
      (key) => key && get(_formState.errors, key),
      _names.mount,
    );

  const handleSubmit: UseFormHandleSubmit<TFieldValues> =
    (onValid, onInvalid) => async (e) => {
      if (e) {
        e.preventDefault && e.preventDefault();
        e.persist && e.persist();
      }
      let hasNoPromiseError = true;
      let fieldValues: any = cloneObject(_formValues);

      _subjects.state.next({
        isSubmitting: true,
      });

      try {
        if (_options.resolver) {
          const { errors, values } = await _executeSchema();
          _formState.errors = errors;
          fieldValues = values;
        } else {
          await executeBuiltInValidation(_fields);
        }

        if (isEmptyObject(_formState.errors)) {
          _subjects.state.next({
            errors: {},
            isSubmitting: true,
          });
          await onValid(fieldValues, e);
        } else {
          if (onInvalid) {
            await onInvalid({ ..._formState.errors }, e);
          }

          _focusError();
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

  const resetField: UseFormResetField<TFieldValues> = (name, options = {}) => {
    if (get(_fields, name)) {
      if (isUndefined(options.defaultValue)) {
        setValue(name, get(_defaultValues, name));
      } else {
        setValue(name, options.defaultValue);
        set(_defaultValues, name, options.defaultValue);
      }

      if (!options.keepTouched) {
        unset(_formState.touchedFields, name);
      }

      if (!options.keepDirty) {
        unset(_formState.dirtyFields, name);
        _formState.isDirty = options.defaultValue
          ? _getDirty(name, get(_defaultValues, name))
          : _getDirty();
      }

      if (!options.keepError) {
        unset(_formState.errors, name);
        _proxyFormState.isValid && _updateValid();
      }

      _subjects.state.next({ ..._formState });
    }
  };

  const _reset: UseFormReset<TFieldValues> = (
    formValues,
    keepStateOptions = {},
  ) => {
    const updatedValues = formValues || _defaultValues;
    const cloneUpdatedValues = cloneObject(updatedValues);
    const values =
      formValues && !isEmptyObject(formValues)
        ? cloneUpdatedValues
        : _defaultValues;

    if (!keepStateOptions.keepDefaultValues) {
      _defaultValues = updatedValues;
    }

    if (!keepStateOptions.keepValues) {
      if (keepStateOptions.keepDirtyValues) {
        for (const fieldName of _names.mount) {
          get(_formState.dirtyFields, fieldName)
            ? set(values, fieldName, get(_formValues, fieldName))
            : setValue(
                fieldName as FieldPath<TFieldValues>,
                get(values, fieldName),
              );
        }
      } else {
        if (isWeb && isUndefined(formValues)) {
          for (const name of _names.mount) {
            const field = get(_fields, name);
            if (field && field._f) {
              const fieldReference = Array.isArray(field._f.refs)
                ? field._f.refs[0]
                : field._f.ref;

              if (isHTMLElement(fieldReference)) {
                const form = fieldReference.closest('form');
                if (form) {
                  form.reset();
                  break;
                }
              }
            }
          }
        }

        _fields = {};
      }

      _formValues = props.shouldUnregister
        ? keepStateOptions.keepDefaultValues
          ? cloneObject(_defaultValues)
          : {}
        : cloneUpdatedValues;

      _subjects.array.next({
        values,
      });

      _subjects.watch.next({
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

    _stateFlags.mount =
      !_proxyFormState.isValid || !!keepStateOptions.keepIsValid;

    _stateFlags.watch = !!props.shouldUnregister;

    _subjects.state.next({
      submitCount: keepStateOptions.keepSubmitCount
        ? _formState.submitCount
        : 0,
      isDirty:
        keepStateOptions.keepDirty || keepStateOptions.keepDirtyValues
          ? _formState.isDirty
          : !!(
              keepStateOptions.keepDefaultValues &&
              !deepEqual(formValues, _defaultValues)
            ),
      isSubmitted: keepStateOptions.keepIsSubmitted
        ? _formState.isSubmitted
        : false,
      dirtyFields:
        keepStateOptions.keepDirty || keepStateOptions.keepDirtyValues
          ? _formState.dirtyFields
          : keepStateOptions.keepDefaultValues && formValues
          ? getDirtyFields(_defaultValues, formValues)
          : {},
      touchedFields: keepStateOptions.keepTouched
        ? _formState.touchedFields
        : {},
      errors: keepStateOptions.keepErrors ? _formState.errors : {},
      isSubmitting: false,
      isSubmitSuccessful: false,
    });
  };

  const reset: UseFormReset<TFieldValues> = (formValues, keepStateOptions) =>
    _reset(
      isFunction(formValues)
        ? formValues(_formValues as TFieldValues)
        : formValues,
      keepStateOptions,
    );

  const setFocus: UseFormSetFocus<TFieldValues> = (name, options = {}) => {
    const field = get(_fields, name);
    const fieldReference = field && field._f;

    if (fieldReference) {
      const fieldRef = fieldReference.refs
        ? fieldReference.refs[0]
        : fieldReference.ref;

      if (fieldRef.focus) {
        fieldRef.focus();
        options.shouldSelect && fieldRef.select();
      }
    }
  };

  return {
    control: {
      register,
      unregister,
      getFieldState,
      _executeSchema,
      _focusError,
      _getWatch,
      _getDirty,
      _updateValid,
      _removeUnmounted,
      _updateFieldArray,
      _getFieldArray,
      _subjects,
      _proxyFormState,
      get _fields() {
        return _fields;
      },
      get _formValues() {
        return _formValues;
      },
      get _stateFlags() {
        return _stateFlags;
      },
      set _stateFlags(value) {
        _stateFlags = value;
      },
      get _defaultValues() {
        return _defaultValues;
      },
      get _names() {
        return _names;
      },
      set _names(value) {
        _names = value;
      },
      get _formState() {
        return _formState;
      },
      set _formState(value) {
        _formState = value;
      },
      get _options() {
        return _options;
      },
      set _options(value) {
        _options = {
          ..._options,
          ...value,
        };
      },
    },
    trigger,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    resetField,
    clearErrors,
    unregister,
    setError,
    setFocus,
    getFieldState,
  };
}
