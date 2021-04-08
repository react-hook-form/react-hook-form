import * as React from 'react';

import focusFieldBy from './logic/focusFieldBy';
import getFields from './logic/getFields';
import getFieldsValues from './logic/getFieldsValues';
import getFieldValue from './logic/getFieldValue';
import getNodeParentName from './logic/getNodeParentName';
import getProxyFormState from './logic/getProxyFormState';
import setFieldArrayDirtyFields from './logic/setFieldArrayDirtyFields';
import shouldRenderFormState from './logic/shouldRenderFormState';
import skipValidation from './logic/skipValidation';
import validateField from './logic/validateField';
import compact from './utils/compact';
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
import { EVENTS, UNDEFINED, VALIDATION_MODE } from './constants';
import {
  ChangeHandler,
  DeepPartial,
  DefaultValues,
  EventType,
  Field,
  FieldArrayDefaultValues,
  FieldError,
  FieldName,
  FieldNamesMarkedBoolean,
  FieldPath,
  FieldRefs,
  FieldValues,
  FormState,
  GetFormIsDirty,
  InternalFieldName,
  InternalNameSet,
  KeepStateOptions,
  Path,
  PathValue,
  ReadFormState,
  Ref,
  RegisterOptions,
  SetFieldValue,
  SetValueConfig,
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
  UseFormSetValue,
  UseFormTrigger,
  UseFormUnregister,
  UseFormWatch,
  WatchInternal,
  WatchObserver,
} from './types';

const isWindowUndefined = typeof window === UNDEFINED;

export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
>({
  mode = VALIDATION_MODE.onSubmit,
  reValidateMode = VALIDATION_MODE.onChange,
  resolver,
  context,
  defaultValues = {} as DefaultValues<TFieldValues>,
  shouldFocusError = true,
  criteriaMode,
}: UseFormProps<TFieldValues, TContext> = {}): UseFormReturn<TFieldValues> {
  const fieldsRef = React.useRef<FieldRefs>({});
  const fieldsNamesRef = React.useRef<Set<InternalFieldName>>(new Set());
  const formStateSubjectRef = React.useRef(
    new Subject<Partial<FormState<TFieldValues>>>(),
  );
  const watchSubjectRef = React.useRef(
    new Subject<{
      name?: InternalFieldName;
      type?: EventType;
      value?: unknown;
    }>(),
  );
  const controllerSubjectRef = React.useRef(
    new Subject<{
      name?: InternalFieldName;
      values: DefaultValues<TFieldValues>;
    }>(),
  );
  const fieldArraySubjectRef = React.useRef(
    new Subject<{
      name?: InternalFieldName;
      fields: any;
      isReset?: boolean;
    }>(),
  );
  const fieldArrayDefaultValuesRef = React.useRef<FieldArrayDefaultValues>({});
  const watchFieldsRef = React.useRef<InternalNameSet>(new Set());
  const isMountedRef = React.useRef(false);
  const fieldsWithValidationRef = React.useRef<
    FieldNamesMarkedBoolean<TFieldValues>
  >({});
  const validFieldsRef = React.useRef<FieldNamesMarkedBoolean<TFieldValues>>(
    {},
  );
  const defaultValuesRef = React.useRef<DefaultValues<TFieldValues>>(
    defaultValues,
  );
  const isWatchAllRef = React.useRef(false);
  const contextRef = React.useRef(context);
  const resolverRef = React.useRef(resolver);
  const fieldArrayNamesRef = React.useRef<InternalNameSet>(new Set());
  const validationMode = getValidationModes(mode);
  const isValidateAllFieldCriteria = criteriaMode === VALIDATION_MODE.all;
  const [formState, setFormState] = React.useState<FormState<TFieldValues>>({
    isDirty: false,
    isValidating: false,
    dirtyFields: {},
    isSubmitted: false,
    submitCount: 0,
    touchedFields: {},
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: !validationMode.isOnSubmit,
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

  contextRef.current = context;
  resolverRef.current = resolver;

  const getIsValid = () =>
    (formStateRef.current.isValid =
      deepEqual(validFieldsRef.current, fieldsWithValidationRef.current) &&
      isEmptyObject(formStateRef.current.errors));

  const shouldRenderBaseOnError = React.useCallback(
    (
      name: InternalFieldName,
      error?: FieldError,
      shouldRender: boolean | null = false,
      state: {
        dirty?: FieldNamesMarkedBoolean<TFieldValues>;
        isDirty?: boolean;
        touched?: FieldNamesMarkedBoolean<TFieldValues>;
      } = {},
      isValid?: boolean,
      isWatched?: boolean,
    ): boolean | void => {
      const previousError = get(formStateRef.current.errors, name);

      let shouldReRender =
        shouldRender ||
        !deepEqual(previousError, error, true) ||
        (readFormStateRef.current.isValid &&
          isUndefined(error) &&
          get(fieldsWithValidationRef.current, name) &&
          !get(validFieldsRef.current, name));

      if (error) {
        unset(validFieldsRef.current, name);
        shouldReRender =
          shouldReRender ||
          !previousError ||
          !deepEqual(previousError, error, true);
        set(formStateRef.current.errors, name, error);
      } else {
        if (get(fieldsWithValidationRef.current, name) || resolverRef.current) {
          set(validFieldsRef.current, name, true);
          shouldReRender = shouldReRender || previousError;
        }

        unset(formStateRef.current.errors, name);
      }

      if (
        (shouldReRender && !isNullOrUndefined(shouldRender)) ||
        !isEmptyObject(state) ||
        isWatched
      ) {
        const updatedFormState = {
          ...state,
          isValid: resolverRef.current ? !!isValid : getIsValid(),
          errors: formStateRef.current.errors,
        };

        formStateRef.current = {
          ...formStateRef.current,
          ...updatedFormState,
        };

        formStateSubjectRef.current.next(isWatched ? {} : updatedFormState);
      }

      formStateSubjectRef.current.next({
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
      const _f = get(fieldsRef.current, name, {})._f as Field['_f'];

      if (_f) {
        const value =
          isWeb && isHTMLElement(_f.ref) && isNullOrUndefined(rawValue)
            ? ''
            : rawValue;
        _f.value = rawValue;

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
          controllerSubjectRef.current.next({
            values: {
              ...defaultValuesRef.current,
              ...values,
            } as DefaultValues<TFieldValues>,
            name,
          });
        }

        options.shouldDirty && updateAndGetDirtyState(name, value);
        options.shouldValidate && trigger(name as Path<TFieldValues>);
      }
    },
    [],
  );

  const getFormIsDirty: GetFormIsDirty = React.useCallback((name, data) => {
    if (readFormStateRef.current.isDirty) {
      const formValues = getFieldsValues(fieldsRef);

      name && data && set(formValues, name, data);

      return !deepEqual(formValues, defaultValuesRef.current);
    }

    return false;
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

        formStateRef.current.isDirty = getFormIsDirty();

        const state = {
          isDirty: formStateRef.current.isDirty,
          dirtyFields: formStateRef.current.dirtyFields,
        };

        const isChanged =
          (readFormStateRef.current.isDirty &&
            previousIsDirty !== state.isDirty) ||
          (readFormStateRef.current.dirtyFields &&
            isDirtyFieldExist !== get(formStateRef.current.dirtyFields, name));

        isChanged && shouldRender && formStateSubjectRef.current.next(state);

        return isChanged ? state : {};
      }

      return {};
    },
    [],
  );

  const executeValidation = React.useCallback(
    async (
      name: InternalFieldName,
      skipReRender?: boolean | null,
    ): Promise<boolean> => {
      const error = (
        await validateField(
          get(fieldsRef.current, name) as Field,
          isValidateAllFieldCriteria,
        )
      )[name];

      shouldRenderBaseOnError(name, error, skipReRender);

      return isUndefined(error);
    },
    [isValidateAllFieldCriteria],
  );

  const executeSchemaOrResolverValidation = React.useCallback(
    async (
      names: InternalFieldName[],
      currentNames: FieldName<TFieldValues>[] = [],
    ) => {
      const { errors } = await resolverRef.current!(
        getFieldsValues(fieldsRef, defaultValuesRef),
        contextRef.current,
        {
          criteriaMode,
          names: currentNames,
          fields: getFields(fieldsNamesRef.current, fieldsRef.current),
        },
      );

      for (const name of names) {
        const error = get(errors, name);
        error
          ? set(formStateRef.current.errors, name, error)
          : unset(formStateRef.current.errors, name);
      }

      return errors;
    },
    [criteriaMode],
  );

  const validateForm = async (fieldsRef: FieldRefs) => {
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

          if (fieldError[_f.name]) {
            set(formStateRef.current.errors, _f.name, fieldError[_f.name]);
            unset(validFieldsRef.current, _f.name);
          } else if (get(fieldsWithValidationRef.current, _f.name)) {
            set(validFieldsRef.current, _f.name, true);
            unset(formStateRef.current.errors, _f.name);
          }
        }

        current && (await validateForm(current));
      }
    }
  };

  const trigger: UseFormTrigger<TFieldValues> = React.useCallback(
    async (name) => {
      const fields = isUndefined(name)
        ? Object.keys(fieldsRef.current)
        : Array.isArray(name)
        ? name
        : [name];
      let isValid;

      formStateSubjectRef.current.next({
        isValidating: true,
      });

      if (resolverRef.current) {
        isValid = isEmptyObject(
          await executeSchemaOrResolverValidation(
            fields,
            isUndefined(name)
              ? undefined
              : (fields as FieldName<TFieldValues>[]),
          ),
        );
      } else {
        isUndefined(name)
          ? await validateForm(fieldsRef.current)
          : await Promise.all(
              fields.map(async (data) => await executeValidation(data, null)),
            );
      }

      formStateSubjectRef.current.next({
        errors: formStateRef.current.errors,
        isValidating: false,
        isValid: resolverRef.current ? isValid : getIsValid(),
      });
    },
    [executeSchemaOrResolverValidation, executeValidation],
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

        field && !field._f
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

  const isFieldWatched = (name: FieldPath<TFieldValues>) =>
    isWatchAllRef.current ||
    watchFieldsRef.current.has(name) ||
    watchFieldsRef.current.has((name.match(/\w+/) || [])[0]);

  const updateValidAndValue = (
    name: InternalFieldName,
    options?: RegisterOptions,
    isWithinRefCallback?: boolean,
  ) => {
    let defaultValue;
    const field = get(fieldsRef.current, name) as Field;
    const useFormDefaultValue = get(defaultValuesRef.current, name);

    if (
      field &&
      (!isEmptyObject(defaultValuesRef.current) || !isUndefined(field._f.value))
    ) {
      defaultValue = isUndefined(field._f.value)
        ? useFormDefaultValue
        : field._f.value;

      if (!isUndefined(defaultValue)) {
        setFieldValue(name, defaultValue);
      }
    }

    if (
      (useFormDefaultValue || (!useFormDefaultValue && isWithinRefCallback)) &&
      options &&
      !validationMode.isOnSubmit &&
      field &&
      readFormStateRef.current.isValid
    ) {
      validateField(field, isValidateAllFieldCriteria).then((error) => {
        isEmptyObject(error)
          ? set(validFieldsRef.current, name, true)
          : unset(validFieldsRef.current, name);

        formStateRef.current.isValid &&
          !isEmptyObject(error) &&
          setFormState({ ...formStateRef.current, isValid: getIsValid() });
      });
    }

    return defaultValue;
  };

  const setValue: UseFormSetValue<TFieldValues> = (
    name,
    value,
    options = {},
  ) => {
    isMountedRef.current = true;
    const field = get(fieldsRef.current, name);
    const isFieldArray = fieldArrayNamesRef.current.has(name);

    if (isFieldArray) {
      fieldArraySubjectRef.current.next({
        fields: value,
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

        formStateSubjectRef.current.next({
          dirtyFields: formStateRef.current.dirtyFields,
          isDirty: getFormIsDirty(name, value),
        });
      }

      !(value as []).length &&
        set(fieldsRef.current, name, []) &&
        set(fieldArrayDefaultValuesRef.current, name, []);
    }

    (field && !field._f) || isFieldArray
      ? setInternalValues(name, value, isFieldArray ? {} : options)
      : setFieldValue(name, value, options, true, !field);

    isFieldWatched(name) && formStateSubjectRef.current.next({});
    watchSubjectRef.current.next({ name, value });
  };

  const handleChange: ChangeHandler = React.useCallback(
    async ({ type, target, target: { value, type: inputType } }) => {
      let name = (target as Ref)!.name;
      let error;
      let isValid;
      const field = get(fieldsRef.current, name) as Field;

      if (field) {
        const inputValue = inputType ? getFieldValue(field) : value;
        const isBlurEvent = type === EVENTS.BLUR;
        const {
          isOnBlur: isReValidateOnBlur,
          isOnChange: isReValidateOnChange,
        } = getValidationModes(reValidateMode);
        const shouldSkipValidation = skipValidation({
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

        const state = updateAndGetDirtyState(name, field._f.value, false);

        if (isBlurEvent && !get(formStateRef.current.touchedFields, name)) {
          set(formStateRef.current.touchedFields, name, true);
          readFormStateRef.current.touchedFields &&
            (state.touchedFields = formStateRef.current.touchedFields);
        }

        let shouldRender = !isEmptyObject(state) || isWatched;

        if (shouldSkipValidation) {
          !isBlurEvent &&
            watchSubjectRef.current.next({
              name,
              type,
              value: inputValue,
            });
          return (
            shouldRender &&
            formStateSubjectRef.current.next(isWatched ? {} : state)
          );
        }

        formStateSubjectRef.current.next({
          isValidating: true,
        });

        if (resolverRef.current) {
          const { errors } = await resolverRef.current(
            getFieldsValues(fieldsRef, defaultValuesRef),
            contextRef.current,
            {
              criteriaMode,
              fields: getFields([name], fieldsRef.current),
              names: [name as FieldName<TFieldValues>],
            },
          );
          const previousFormIsValid = formStateRef.current.isValid;
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

          previousFormIsValid !== isValid && (shouldRender = true);
        } else {
          error = (await validateField(field, isValidateAllFieldCriteria))[
            name
          ];
        }

        !isBlurEvent &&
          watchSubjectRef.current.next({
            name,
            type,
            value: inputValue,
          });
        shouldRenderBaseOnError(
          name,
          error,
          shouldRender,
          state,
          isValid,
          isWatched,
        );
      }
    },
    [],
  );

  const getValues: UseFormGetValues<TFieldValues> = (
    fieldNames?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[],
  ) => {
    const values = isMountedRef.current
      ? getFieldsValues(fieldsRef, defaultValuesRef)
      : defaultValuesRef.current;

    return isUndefined(fieldNames)
      ? values
      : isString(fieldNames)
      ? get(values, fieldNames as InternalFieldName)
      : fieldNames.map((name) => get(values, name as InternalFieldName));
  };

  const updateIsValid = React.useCallback(
    async (values = {}) => {
      const previousIsValid = formStateRef.current.isValid;

      if (resolver) {
        const { errors } = await resolverRef.current!(
          {
            ...getFieldsValues(fieldsRef, defaultValuesRef),
            ...values,
          },
          contextRef.current,
          {
            criteriaMode,
            fields: getFields(fieldsNamesRef.current, fieldsRef.current),
          },
        );
        formStateRef.current.isValid = isEmptyObject(errors);
      } else {
        getIsValid();
      }

      previousIsValid !== formStateRef.current.isValid &&
        formStateSubjectRef.current.next({
          isValid: formStateRef.current.isValid,
        });
    },
    [criteriaMode],
  );

  const clearErrors: UseFormClearErrors<TFieldValues> = (name) => {
    name &&
      (Array.isArray(name) ? name : [name]).forEach((inputName) =>
        unset(formStateRef.current.errors, inputName),
      );

    formStateSubjectRef.current.next({
      errors: name ? formStateRef.current.errors : {},
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

    formStateSubjectRef.current.next({
      errors: formStateRef.current.errors,
      isValid: false,
    });

    options && options.shouldFocus && ref && ref.focus && ref.focus();
  };

  const watchInternal: WatchInternal<TFieldValues> = React.useCallback(
    (fieldNames, defaultValue, isGlobal) => {
      const isArrayNames = Array.isArray(fieldNames);
      const fieldValues = isMountedRef.current
        ? getValues()
        : isUndefined(defaultValue)
        ? defaultValuesRef.current
        : isArrayNames
        ? defaultValue || {}
        : { [fieldNames as string]: defaultValue };

      if (isUndefined(fieldNames)) {
        isGlobal && (isWatchAllRef.current = true);
        return fieldValues;
      }

      const result = [];

      for (const fieldName of isArrayNames ? fieldNames : [fieldNames]) {
        isGlobal && watchFieldsRef.current.add(fieldName as string);
        result.push(get(fieldValues, fieldName as string));
      }

      return isArrayNames ? result : result[0];
    },
    [],
  );

  const watch: UseFormWatch<TFieldValues> = (
    fieldName?:
      | FieldPath<TFieldValues>
      | FieldPath<TFieldValues>[]
      | WatchObserver<TFieldValues>,
    defaultValue?: unknown,
  ) =>
    isFunction(fieldName)
      ? watchSubjectRef.current.subscribe({
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
          fieldName as string | string[],
          defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>,
          true,
        );

  const unregister: UseFormUnregister<TFieldValues> = (name, options = {}) => {
    for (const inputName of name
      ? Array.isArray(name)
        ? name
        : [name]
      : Object.keys(fieldsNamesRef.current)) {
      fieldsNamesRef.current.delete(inputName);
      fieldArrayNamesRef.current.delete(inputName);

      if (get(fieldsRef.current, inputName) as Field) {
        if (!options.keepIsValid) {
          unset(fieldsWithValidationRef.current, inputName);
          unset(validFieldsRef.current, inputName);
        }
        !options.keepError && unset(formStateRef.current.errors, inputName);
        !options.keepValue && unset(fieldsRef.current, inputName);
        !options.keepDirty &&
          unset(formStateRef.current.dirtyFields, inputName);
        !options.keepTouched &&
          unset(formStateRef.current.touchedFields, inputName);
        !options.keepDefaultValue && unset(defaultValuesRef.current, inputName);

        watchSubjectRef.current.next({
          name: inputName,
        });
      }
    }

    formStateSubjectRef.current.next({
      ...formStateRef.current,
      ...(!options.keepDirty ? {} : { isDirty: getFormIsDirty() }),
      ...(resolverRef.current ? {} : { isValid: getIsValid() }),
    });

    if (!options.keepIsValid) {
      updateIsValid();
    }
  };

  const registerFieldRef = (
    name: InternalFieldName,
    ref: HTMLInputElement,
    options?: RegisterOptions,
  ): ((name: InternalFieldName) => void) | void => {
    let field = get(fieldsRef.current, name) as Field;

    if (field) {
      const isRadioOrCheckbox = isRadioOrCheckboxFunction(ref);

      if (
        (isRadioOrCheckbox
          ? Array.isArray(field._f.refs) &&
            compact(field._f.refs).find(
              (option) => ref.value === option.value && option === ref,
            )
          : ref === field._f.ref) ||
        !field ||
        (isWeb && isHTMLElement(field._f.ref) && !isHTMLElement(ref))
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

      const defaultValue = updateValidAndValue(name, options, true);

      if (
        isRadioOrCheckbox && Array.isArray(defaultValue)
          ? !deepEqual(get(fieldsRef.current, name)._f.value, defaultValue)
          : isUndefined(get(fieldsRef.current, name)._f.value)
      ) {
        get(fieldsRef.current, name)._f.value = getFieldValue(
          get(fieldsRef.current, name),
        );
      }
    }
  };

  const register: UseFormRegister<TFieldValues> = React.useCallback(
    (name, options) => {
      const isInitialRegister = !get(fieldsRef.current, name);

      set(fieldsRef.current, name, {
        _f: {
          ...(isInitialRegister
            ? { ref: { name } }
            : {
                ref: (get(fieldsRef.current, name)._f || {}).ref,
                ...get(fieldsRef.current, name)._f,
              }),
          name,
          ...options,
        },
      });
      options && set(fieldsWithValidationRef.current, name, true);
      fieldsNamesRef.current.add(name);
      isInitialRegister && updateValidAndValue(name, options);

      return isWindowUndefined
        ? ({ name: name as InternalFieldName } as UseFormRegisterReturn)
        : {
            name,
            onChange: handleChange,
            onBlur: handleChange,
            ref: (ref: HTMLInputElement | null) =>
              ref && registerFieldRef(name, ref, options),
          };
    },
    [defaultValuesRef.current],
  );

  const handleSubmit: UseFormHandleSubmit<TFieldValues> = React.useCallback(
    (onValid, onInvalid) => async (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
        e.persist();
      }
      let fieldValues = {
        ...defaultValuesRef.current,
        ...getFieldsValues(fieldsRef, defaultValuesRef),
      };

      formStateSubjectRef.current.next({
        isSubmitting: true,
      });

      try {
        if (resolverRef.current) {
          const { errors, values } = await resolverRef.current(
            fieldValues,
            contextRef.current,
            {
              criteriaMode,
              fields: getFields(fieldsNamesRef.current, fieldsRef.current),
            },
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
          formStateSubjectRef.current.next({
            errors: {},
            isSubmitting: true,
          });
          await onValid(fieldValues, e);
        } else {
          onInvalid && (await onInvalid(formStateRef.current.errors, e));
          shouldFocusError &&
            focusFieldBy(
              fieldsRef.current,
              (key: string) => get(formStateRef.current.errors, key),
              fieldsNamesRef.current,
            );
        }
      } finally {
        formStateRef.current.isSubmitted = true;
        formStateSubjectRef.current.next({
          isSubmitted: true,
          isSubmitting: false,
          isSubmitSuccessful: isEmptyObject(formStateRef.current.errors),
          submitCount: formStateRef.current.submitCount + 1,
          errors: formStateRef.current.errors,
        });
      }
    },
    [shouldFocusError, isValidateAllFieldCriteria, criteriaMode],
  );

  const resetFromState = React.useCallback(
    ({
      keepErrors,
      keepDirty,
      keepIsSubmitted,
      keepTouched,
      keepIsValid,
      keepSubmitCount,
    }: KeepStateOptions) => {
      if (!keepIsValid) {
        validFieldsRef.current = {};
        fieldsWithValidationRef.current = {};
      }

      watchFieldsRef.current = new Set();
      isWatchAllRef.current = false;

      formStateSubjectRef.current.next({
        submitCount: keepSubmitCount ? formStateRef.current.submitCount : 0,
        isDirty: keepDirty ? formStateRef.current.isDirty : false,
        isSubmitted: keepIsSubmitted ? formStateRef.current.isSubmitted : false,
        isValid: keepIsValid
          ? formStateRef.current.isValid
          : !validationMode.isOnSubmit,
        dirtyFields: keepDirty ? formStateRef.current.dirtyFields : {},
        touchedFields: keepTouched ? formStateRef.current.touchedFields : {},
        errors: keepErrors ? formStateRef.current.errors : {},
        isSubmitting: false,
        isSubmitSuccessful: false,
      });
    },
    [],
  );

  const reset: UseFormReset<TFieldValues> = (values, keepStateOptions = {}) => {
    const updatedValues = values || defaultValuesRef.current;

    if (isWeb && !keepStateOptions.keepValues) {
      for (const field of Object.values(fieldsRef.current)) {
        if (field && field._f) {
          const inputRef = Array.isArray(field._f.refs)
            ? field._f.refs[0]
            : field._f.ref;

          if (isHTMLElement(inputRef)) {
            try {
              inputRef.closest('form')!.reset();
              break;
            } catch {}
          }
        }
      }
    }

    !keepStateOptions.keepDefaultValues &&
      (defaultValuesRef.current = { ...updatedValues });

    if (!keepStateOptions.keepValues) {
      fieldsRef.current = {};

      controllerSubjectRef.current.next({
        values: { ...updatedValues },
      });

      watchSubjectRef.current.next({
        value: { ...updatedValues },
      });

      fieldArraySubjectRef.current.next({
        fields: { ...updatedValues },
        isReset: true,
      });
    }

    resetFromState(keepStateOptions);
  };

  React.useEffect(() => {
    isMountedRef.current = true;
    const formStateSubscription = formStateSubjectRef.current.subscribe({
      next(formState: Partial<FormState<TFieldValues>> = {}) {
        if (shouldRenderFormState(formState, readFormStateRef.current, true)) {
          formStateRef.current = {
            ...formStateRef.current,
            ...formState,
          };
          setFormState(formStateRef.current);
        }
      },
    });

    const useFieldArraySubscription = fieldArraySubjectRef.current.subscribe({
      next(state) {
        if (state.fields && state.name && readFormStateRef.current.isValid) {
          const values = getFieldsValues(fieldsRef);
          set(values, state.name, state.fields);
          updateIsValid(values);
        }
      },
    });

    resolverRef.current && readFormStateRef.current.isValid && updateIsValid();

    return () => {
      watchSubjectRef.current.unsubscribe();
      formStateSubscription.unsubscribe();
      useFieldArraySubscription.unsubscribe();
    };
  }, []);

  return {
    control: React.useMemo(
      () => ({
        register,
        isWatchAllRef,
        watchFieldsRef,
        getFormIsDirty,
        formStateSubjectRef,
        fieldArraySubjectRef,
        controllerSubjectRef,
        watchSubjectRef,
        watchInternal,
        fieldsRef,
        validFieldsRef,
        fieldsWithValidationRef,
        fieldArrayNamesRef,
        readFormStateRef,
        formStateRef,
        defaultValuesRef,
        fieldArrayDefaultValuesRef,
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
  };
}
