import { EVENTS, VALIDATION_MODE } from '../constants';
import {
  BatchFieldArrayUpdate,
  ChangeHandler,
  DeepPartial,
  DelayCallback,
  Field,
  FieldError,
  FieldErrors,
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
import isBoolean from '../utils/isBoolean';
import isCheckBoxInput from '../utils/isCheckBoxInput';
import isDateObject from '../utils/isDateObject';
import isEmptyObject from '../utils/isEmptyObject';
import isFunction from '../utils/isFunction';
import isHTMLElement from '../utils/isHTMLElement';
import isMultipleSelect from '../utils/isMultipleSelect';
import isNullOrUndefined from '../utils/isNullOrUndefined';
import isPrimitive from '../utils/isPrimitive';
import isRadioOrCheckboxFunction from '../utils/isRadioOrCheckbox';
import isString from '../utils/isString';
import isUndefined from '../utils/isUndefined';
import isWeb from '../utils/isWeb';
import live from '../utils/live';
import omit from '../utils/omit';
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
  let _options = {
    ...defaultOptions,
    ...props,
  };
  let _formState: FormState<TFieldValues> = {
    isDirty: false,
    isValidating: false,
    dirtyFields: {} as FieldNamesMarkedBoolean<TFieldValues>,
    isSubmitted: false,
    submitCount: 0,
    touchedFields: {} as FieldNamesMarkedBoolean<TFieldValues>,
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    errors: {} as FieldErrors<TFieldValues>,
  };
  let _fields = {};
  let _defaultValues = _options.defaultValues || {};
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
  let delayErrorCallback: DelayCallback;
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
    watch: new Subject(),
    control: new Subject(),
    array: new Subject(),
    state: new Subject(),
  };

  const validationModeBeforeSubmit = getValidationModes(_options.mode);
  const validationModeAfterSubmit = getValidationModes(_options.reValidateMode);
  const shouldDisplayAllAssociatedErrors =
    _options.criteriaMode === VALIDATION_MODE.all;

  const debounce =
    <T extends Function>(callback: T, wait: number) =>
    (...args: any) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => callback(...args), wait);
    };

  const isFieldWatched = (
    name: FieldPath<TFieldValues>,
    isBlurEvent?: boolean,
  ) =>
    !isBlurEvent &&
    (_names.watchAll ||
      _names.watch.has(name) ||
      _names.watch.has((name.match(/\w+/) || [])[0]));

  const _updateValid = async (shouldSkipRender?: boolean) => {
    let isValid = false;

    if (_proxyFormState.isValid) {
      isValid = _options.resolver
        ? isEmptyObject((await executeResolver()).errors)
        : await executeBuildInValidation(_fields, true);

      if (!shouldSkipRender && isValid !== _formState.isValid) {
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
    method,
    args,
    values = [],
    shouldSetValues = true,
    shouldSetFields = true,
  ) => {
    _stateFlags.action = true;

    if (shouldSetFields && get(_fields, name)) {
      const fieldValues = method(get(_fields, name), args.argA, args.argB);
      shouldSetValues && set(_fields, name, fieldValues);
    }

    if (Array.isArray(get(_formState.errors, name))) {
      const errors = method(get(_formState.errors, name), args.argA, args.argB);
      shouldSetValues && set(_formState.errors, name, errors);
      unsetEmptyArray(_formState.errors, name);
    }

    if (_proxyFormState.touchedFields && get(_formState.touchedFields, name)) {
      const touchedFields = method(
        get(_formState.touchedFields, name),
        args.argA,
        args.argB,
      );
      shouldSetValues &&
        set(_formState.touchedFields as TFieldValues, name, touchedFields);
      unsetEmptyArray(_formState.touchedFields, name);
    }

    if (_proxyFormState.dirtyFields || _proxyFormState.isDirty) {
      updateFieldArrayDirty(name, values);
    }

    _subjects.state.next({
      isDirty: _getDirty(name, values),
      dirtyFields: _formState.dirtyFields,
      errors: _formState.errors,
      isValid: _formState.isValid,
    });
  };

  const updateErrors = (name: InternalFieldName, error: FieldError) => (
    set(_formState.errors, name, error),
    _subjects.state.next({
      errors: _formState.errors,
    })
  );

  const updateValidAndValue = (
    name: InternalFieldName,
    shouldSkipSetValueAs?: boolean,
    ref?: Ref,
  ) => {
    const field: Field = get(_fields, name);

    if (field) {
      const defaultValue = get(_formValues, name, get(_defaultValues, name));

      isUndefined(defaultValue) ||
      (ref && (ref as HTMLInputElement).defaultChecked) ||
      shouldSkipSetValueAs
        ? set(
            _formValues,
            name,
            shouldSkipSetValueAs ? defaultValue : getFieldValue(field._f),
          )
        : setFieldValue(name, defaultValue);
    }

    _stateFlags.mount && _updateValid();
  };

  const updateTouchAndDirty = (
    name: InternalFieldName,
    fieldValue: unknown,
    isCurrentTouched?: boolean,
    shouldRender = true,
  ): Partial<
    Pick<FormState<TFieldValues>, 'dirtyFields' | 'isDirty' | 'touchedFields'>
  > => {
    let isFieldDirty = false;
    const output: Partial<FormState<TFieldValues>> & { name: string } = {
      name,
    };
    const isPreviousFieldTouched = get(_formState.touchedFields, name);

    if (_proxyFormState.isDirty) {
      const isPreviousFormDirty = _formState.isDirty;

      _formState.isDirty = output.isDirty = _getDirty();
      isFieldDirty = isPreviousFormDirty !== output.isDirty;
    }

    if (_proxyFormState.dirtyFields && !isCurrentTouched) {
      const isPreviousFieldDirty = get(_formState.dirtyFields, name);
      const isCurrentFieldPristine = deepEqual(
        get(_defaultValues, name),
        fieldValue,
      );

      isCurrentFieldPristine
        ? unset(_formState.dirtyFields, name)
        : set(_formState.dirtyFields as TFieldValues, name, true);
      output.dirtyFields = _formState.dirtyFields;
      isFieldDirty =
        isFieldDirty ||
        isPreviousFieldDirty !== get(_formState.dirtyFields, name);
    }

    if (isCurrentTouched && !isPreviousFieldTouched) {
      set(_formState.touchedFields as TFieldValues, name, isCurrentTouched);
      output.touchedFields = _formState.touchedFields;
      isFieldDirty =
        isFieldDirty ||
        (_proxyFormState.touchedFields &&
          isPreviousFieldTouched !== isCurrentTouched);
    }

    isFieldDirty && shouldRender && _subjects.state.next(output);

    return isFieldDirty ? output : {};
  };

  const updateFieldArrayDirty = (name: any, value: any) => (
    set(
      _formState.dirtyFields as TFieldValues,
      name,
      setFieldArrayDirtyFields(
        value,
        get(_defaultValues, name, []),
        get(_formState.dirtyFields, name, []),
      ),
    ),
    unsetEmptyArray(_formState.dirtyFields, name)
  );

  const shouldRenderByError = async (
    shouldSkipRender: boolean,
    name: InternalFieldName,
    isValid: boolean,
    error?: FieldError,
    fieldState?: {
      dirty?: FieldNamesMarkedBoolean<TFieldValues>;
      isDirty?: boolean;
      touched?: FieldNamesMarkedBoolean<TFieldValues>;
    },
  ): Promise<void> => {
    const previousFieldError = get(_formState.errors, name);
    const shouldUpdateValid =
      _proxyFormState.isValid && _formState.isValid !== isValid;

    if (props.delayError && error) {
      delayErrorCallback =
        delayErrorCallback || debounce(updateErrors, props.delayError);
      delayErrorCallback(name, error);
    } else {
      clearTimeout(timer);
      error
        ? set(_formState.errors, name, error)
        : unset(_formState.errors, name);
    }

    if (
      ((error ? !deepEqual(previousFieldError, error) : previousFieldError) ||
        !isEmptyObject(fieldState) ||
        shouldUpdateValid) &&
      !shouldSkipRender
    ) {
      const updatedFormState = {
        ...fieldState,
        ...(shouldUpdateValid ? { isValid } : {}),
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

    if (_proxyFormState.isValidating && !validateFields[name]) {
      _subjects.state.next({
        isValidating: false,
      });
      validateFields = {};
    }
  };

  const executeResolver = async (name?: InternalFieldName[]) =>
    _options.resolver
      ? await _options.resolver(
          { ..._formValues } as UnpackNestedValue<TFieldValues>,
          _options.context,
          getResolverOptions(
            name || _names.mount,
            _fields,
            _options.criteriaMode,
            _options.shouldUseNativeValidation,
          ),
        )
      : ({} as ResolverResult<TFieldValues>);

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
      _formState.errors = errors as FieldErrors<TFieldValues>;
    }

    return errors;
  };

  const executeBuildInValidation = async (
    fields: FieldRefs,
    shouldOnlyCheckValid?: boolean,
    context = {
      valid: true,
    },
  ) => {
    for (const name in fields) {
      const field = fields[name];

      if (field) {
        const fieldReference = field._f;
        const fieldValue = omit(field, '_f');

        if (fieldReference) {
          const fieldError = await validateField(
            field,
            get(_formValues, fieldReference.name),
            shouldDisplayAllAssociatedErrors,
            _options.shouldUseNativeValidation,
          );

          if (fieldError[fieldReference.name]) {
            context.valid = false;

            if (shouldOnlyCheckValid) {
              break;
            }
          }

          if (!shouldOnlyCheckValid) {
            fieldError[fieldReference.name]
              ? set(
                  _formState.errors,
                  fieldReference.name,
                  fieldError[fieldReference.name],
                )
              : unset(_formState.errors, fieldReference.name);
          }
        }

        fieldValue &&
          (await executeBuildInValidation(
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
        (field._f.refs ? field._f.refs.every(live) : live(field._f.ref)) &&
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
  ) => {
    const fieldValues = {
      ...(_stateFlags.mount
        ? _formValues
        : isUndefined(defaultValue)
        ? _defaultValues
        : isString(names)
        ? { [names]: defaultValue }
        : defaultValue),
    };

    if (names) {
      const result = convertToArrayPayload(names).map(
        (fieldName) => (
          isGlobal && _names.watch.add(fieldName as InternalFieldName),
          get(fieldValues, fieldName as InternalFieldName)
        ),
      );

      return Array.isArray(names) ? result : result[0];
    }

    isGlobal && (_names.watchAll = true);
    return fieldValues;
  };

  const _getFieldArray = (name: InternalFieldName) =>
    get(_stateFlags.mount ? _formValues : _defaultValues, name, []);

  const setFieldValue = (
    name: InternalFieldName,
    value: SetFieldValue<TFieldValues>,
    options: SetValueConfig = {},
    shouldRender?: boolean,
  ) => {
    const field: Field = get(_fields, name);
    let fieldValue: unknown = value;

    if (field) {
      const fieldReference = field._f;

      if (fieldReference) {
        set(_formValues, name, getFieldValueAs(value, fieldReference));

        fieldValue =
          isWeb && isHTMLElement(fieldReference.ref) && isNullOrUndefined(value)
            ? ''
            : value;

        if (isMultipleSelect(fieldReference.ref)) {
          [...fieldReference.ref.options].forEach(
            (selectRef) =>
              (selectRef.selected = (
                fieldValue as InternalFieldName[]
              ).includes(selectRef.value)),
          );
        } else if (fieldReference.refs) {
          if (isCheckBoxInput(fieldReference.ref)) {
            fieldReference.refs.length > 1
              ? fieldReference.refs.forEach(
                  (checkboxRef) =>
                    (checkboxRef.checked = Array.isArray(fieldValue)
                      ? !!(fieldValue as []).find(
                          (data: string) => data === checkboxRef.value,
                        )
                      : fieldValue === checkboxRef.value),
                )
              : (fieldReference.refs[0].checked = !!fieldValue);
          } else {
            fieldReference.refs.forEach(
              (radioRef: HTMLInputElement) =>
                (radioRef.checked = radioRef.value === fieldValue),
            );
          }
        } else {
          fieldReference.ref.value = fieldValue;
        }

        shouldRender &&
          _subjects.control.next({
            values: _formValues,
            name,
          });
      }
    }

    (options.shouldDirty || options.shouldTouch) &&
      updateTouchAndDirty(name, fieldValue, options.shouldTouch);

    options.shouldValidate && trigger(name as Path<TFieldValues>);
  };

  const setValues = (
    name: FieldPath<TFieldValues>,
    value: UnpackNestedValue<PathValue<TFieldValues, FieldPath<TFieldValues>>>,
    options: SetValueConfig,
  ) => {
    for (const fieldKey in value) {
      const fieldValue: SetFieldValue<TFieldValues> = value[fieldKey];
      const fieldName = `${name}.${fieldKey}` as Path<TFieldValues>;
      const field = get(_fields, fieldName);

      (_names.array.has(name) ||
        !isPrimitive(fieldValue) ||
        (field && !field._f)) &&
      !isDateObject(fieldValue)
        ? setValues(fieldName, fieldValue, options)
        : setFieldValue(fieldName, fieldValue, options, true);
    }
  };

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
        updateFieldArrayDirty(name, value);

        _subjects.state.next({
          name,
          dirtyFields: _formState.dirtyFields,
          isDirty: _getDirty(name, value),
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

  const handleChange: ChangeHandler = async (event) => {
    const target = event.target;
    let name = target.name;
    const field: Field = get(_fields, name);

    if (field) {
      let error;
      let isValid;
      const fieldValue = target.type ? getFieldValue(field._f) : target.value;
      const isBlurEvent = event.type === EVENTS.BLUR;
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
      const isWatched = isFieldWatched(name, isBlurEvent);

      if (isBlurEvent) {
        field._f.onBlur && field._f.onBlur(event);
      } else if (field._f.onChange) {
        field._f.onChange(event);
      }

      set(_formValues, name, fieldValue);

      const fieldState = updateTouchAndDirty(
        name,
        fieldValue,
        isBlurEvent,
        false,
      );

      const shouldRender = !isEmptyObject(fieldState) || isWatched;

      !isBlurEvent &&
        _subjects.watch.next({
          name,
          type: event.type,
        });

      if (shouldSkipValidation) {
        return (
          shouldRender &&
          _subjects.state.next({ name, ...(isWatched ? {} : fieldState) })
        );
      }

      !isBlurEvent && isWatched && _subjects.state.next({});

      validateFields[name] = validateFields[name] ? +1 : 1;

      _proxyFormState.isValidating &&
        _subjects.state.next({
          isValidating: true,
        });

      if (_options.resolver) {
        const { errors } = await executeResolver([name]);
        error = get(errors, name);

        if (isCheckBoxInput(target) && !error) {
          const parentNodeName = getNodeParentName(name);
          const parentField = get(_fields, parentNodeName);

          if (
            Array.isArray(parentField) &&
            parentField.every(
              (field: Field) => field._f && isCheckBoxInput(field._f.ref),
            )
          ) {
            const parentError = get(errors, parentNodeName, {});
            parentError.type && (error = parentError);
            name = parentNodeName;
          }
        }

        isValid = isEmptyObject(errors);
      } else {
        error = (
          await validateField(
            field,
            get(_formValues, name) as Field,
            shouldDisplayAllAssociatedErrors,
            _options.shouldUseNativeValidation,
          )
        )[name];

        isValid = await _updateValid(true);
      }

      field._f.deps && trigger(field._f.deps as FieldPath<TFieldValues>[]);

      shouldRenderByError(false, name, isValid, error, fieldState);
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
      const errors = await executeResolverValidation(
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
            return await executeBuildInValidation(
              field && field._f ? { [fieldName]: field } : field,
            );
          }),
        )
      ).every(Boolean);
      _updateValid();
    } else {
      validationResult = isValid = await executeBuildInValidation(_fields);
    }

    _subjects.state.next({
      ...(!isString(name) || isValid !== _formState.isValid ? {} : { name }),
      errors: _formState.errors,
      isValid,
      isValidating: false,
    });

    options.shouldFocus &&
      !validationResult &&
      focusFieldBy(
        _fields,
        (key) => get(_formState.errors, key),
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

  const clearErrors: UseFormClearErrors<TFieldValues> = (name) => {
    name
      ? convertToArrayPayload(name).forEach((inputName) =>
          unset(_formState.errors, inputName),
        )
      : (_formState.errors = {} as FieldErrors<TFieldValues>);

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
          next: (info: any) =>
            name(
              _getWatch(
                undefined,
                defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>,
              ),
              info,
            ),
        })
      : _getWatch(
          name as InternalFieldName | InternalFieldName[],
          defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>,
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
    const field = get(_fields, name);

    set(_fields, name, {
      _f: {
        ...(field && field._f ? field._f : { ref: { name } }),
        name,
        mount: true,
        ...options,
      },
    });
    _names.mount.add(name);

    !isUndefined(options.value) && set(_formValues, name, options.value);

    field
      ? isBoolean(options.disabled) &&
        set(
          _formValues,
          name,
          options.disabled
            ? undefined
            : get(_formValues, name, getFieldValue(field._f)),
        )
      : updateValidAndValue(name, true);

    return isWindowUndefined
      ? ({ name: name as InternalFieldName } as UseFormRegisterReturn)
      : {
          name,
          ...(isBoolean(options.disabled)
            ? { disabled: options.disabled }
            : {}),
          onChange: handleChange,
          onBlur: handleChange,
          ref: (ref: HTMLInputElement | null): void => {
            if (ref) {
              register(name, options);
              let field: Field = get(_fields, name);
              const fieldRef = isUndefined(ref.value)
                ? ref.querySelectorAll
                  ? (ref.querySelectorAll('input,select,textarea')[0] as Ref) ||
                    ref
                  : ref
                : ref;

              const isRadioOrCheckbox = isRadioOrCheckboxFunction(fieldRef);

              if (
                fieldRef === field._f.ref ||
                (isRadioOrCheckbox &&
                  compact(field._f.refs || []).find(
                    (option) => option === fieldRef,
                  ))
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
                        fieldRef,
                      ],
                      ref: { type: fieldRef.type, name },
                    }
                  : {
                      ...field._f,
                      ref: fieldRef,
                    },
              };

              set(_fields, name, field);

              (!options || !options.disabled) &&
                updateValidAndValue(name, false, fieldRef);
            } else {
              const field: Field = get(_fields, name, {});
              const shouldUnregister =
                _options.shouldUnregister || options.shouldUnregister;

              if (field._f) {
                field._f.mount = false;
              }

              shouldUnregister &&
                !(
                  isNameInFieldArray(_names.array, name) && _stateFlags.action
                ) &&
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
        if (_options.resolver) {
          const { errors, values } = await executeResolver();
          _formState.errors = errors as FieldErrors<TFieldValues>;
          fieldValues = values;
        } else {
          await executeBuildInValidation(_fields);
        }

        if (
          isEmptyObject(_formState.errors) &&
          Object.keys(_formState.errors).every((name) => get(fieldValues, name))
        ) {
          _subjects.state.next({
            errors: {} as FieldErrors<TFieldValues>,
            isSubmitting: true,
          });
          await onValid(fieldValues, e);
        } else {
          onInvalid && (await onInvalid(_formState.errors, e));
          _options.shouldFocusError &&
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
    const hasUpdatedFormValues = !isEmptyObject(formValues);
    const updatedValues = formValues || _defaultValues;
    const cloneUpdatedValues = cloneObject(updatedValues);

    if (!keepStateOptions.keepDefaultValues) {
      _defaultValues = updatedValues;
    }

    if (!keepStateOptions.keepValues) {
      if (isWeb) {
        for (const name of _names.mount) {
          const field = get(_fields, name);
          if (field && field._f) {
            const fieldReference = Array.isArray(field._f.refs)
              ? field._f.refs[0]
              : field._f.ref;

            try {
              isHTMLElement(fieldReference) &&
                fieldReference.closest('form')!.reset();
              break;
            } catch {}
          }
        }
      }

      _formValues = props.shouldUnregister ? {} : cloneUpdatedValues;
      _fields = {};

      _subjects.control.next({
        values: hasUpdatedFormValues ? cloneUpdatedValues : _defaultValues,
      });

      _subjects.watch.next({});

      _subjects.array.next({
        values: cloneUpdatedValues,
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
        ? !deepEqual(formValues, _defaultValues)
        : false,
      isSubmitted: keepStateOptions.keepIsSubmitted
        ? _formState.isSubmitted
        : false,
      dirtyFields: keepStateOptions.keepDirty
        ? _formState.dirtyFields
        : ((keepStateOptions.keepDefaultValues && formValues
            ? Object.entries(formValues).reduce(
                (previous, [key, value]) => ({
                  ...previous,
                  [key]: value !== get(_defaultValues, key),
                }),
                {},
              )
            : {}) as FieldNamesMarkedBoolean<TFieldValues>),
      touchedFields: keepStateOptions.keepTouched
        ? _formState.touchedFields
        : ({} as FieldNamesMarkedBoolean<TFieldValues>),
      errors: keepStateOptions.keepErrors
        ? _formState.errors
        : ({} as FieldErrors<TFieldValues>),
      isSubmitting: false,
      isSubmitSuccessful: false,
    });

    _stateFlags.mount =
      !_proxyFormState.isValid || !!keepStateOptions.keepIsValid;
    _stateFlags.watch = !!props.shouldUnregister;
  };

  const setFocus: UseFormSetFocus<TFieldValues> = (name) => {
    const ref = get(_fields, name)._f;
    (ref.focus || ref.refs[0]).focus();
  };

  return {
    control: {
      register,
      unregister,
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
      set _fields(value) {
        _fields = value;
      },
      get _formValues() {
        return _formValues;
      },
      set _formValues(value) {
        _formValues = value;
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
      set _defaultValues(value) {
        _defaultValues = value;
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
    clearErrors,
    unregister,
    setError,
    setFocus,
  };
}
