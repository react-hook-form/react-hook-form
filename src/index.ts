import { useRef, useState, useEffect } from 'react';
import getFieldsValues from './logic/getFieldsValues';
import validateField from './logic/validateField';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import getFieldValue from './logic/getFieldValue';
import onDomRemove from './utils/onDomRemove';
import isRadioInput from './utils/isRadioInput';
import attachEventListeners from './logic/attachEventListeners';
import validateWithSchema from './logic/validateWithSchema';
import combineFieldValues from './logic/combineFieldValues';
import shouldUpdateWithError from './logic/shouldUpdateWithError';
import warnMissingRef from './utils/warnMissingRef';
import { Props, IField, IErrorMessages, Ref, SubmitPromiseResult } from './type';

export default function useForm(
  { mode, validationSchema }: Props = {
    mode: 'onSubmit',
  },
) {
  const fieldsRef = useRef<{ [key: string]: IField }>({});
  const errorsRef = useRef<IErrorMessages>({});
  const isWatchAllRef = useRef<boolean>(false);
  const isSubmittedRef = useRef<boolean>(false);
  const isDirtyRef = useRef<boolean>(false);
  const touchedFieldsRef = useRef<Array<string>>([]);
  const watchFieldsRef = useRef<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<IErrorMessages>({});

  async function validateAndStateUpdate({ target: { name }, type }: any) {
    const fields = fieldsRef.current;
    const errors = errorsRef.current;
    const ref = fields[name];
    const onSubmitModeNotSubmitted = !isSubmittedRef.current && (mode === 'onSubmit' || !mode);
    const isWatchAll = isWatchAllRef.current;
    const shouldUpdateWatchMode = isWatchAll || watchFieldsRef.current[name];
    const shouldUpdateValidateMode = mode === 'onChange' || (mode === 'onBlur' && type === 'blur');
    let shouldUpdateState = isWatchAll;

    if (!isDirtyRef.current) {
      isDirtyRef.current = true;
      shouldUpdateState = true;
    }

    if (!touchedFieldsRef.current.includes(name)) {
      touchedFieldsRef.current.push(name);
      shouldUpdateState = true;
    }

    if (onSubmitModeNotSubmitted && shouldUpdateWatchMode) return setErrors({});

    if (validationSchema) {
      const result = getFieldsValues(fields);
      const error = (await validateWithSchema(validationSchema, result)) || {};
      const shouldUpdate = ((!error[name] && errors[name]) || error[name]) && shouldUpdateValidateMode;

      if (shouldUpdate || shouldUpdateWatchMode) {
        const errorsCopy = { ...errors, ...{ [name]: error[name] } };
        if (!error[name]) delete errorsCopy[name];

        errorsRef.current = errorsCopy;
        return setErrors(errorsCopy);
      }
    } else {
      const error = await validateField(ref, fields);
      const shouldUpdate = shouldUpdateWithError({
        errors,
        error,
        onSubmitModeNotSubmitted,
        name,
        mode,
        type,
      });

      if (shouldUpdate || shouldUpdateValidateMode || shouldUpdateWatchMode) {
        const errorsCopy = { ...errors, ...error };
        if (!error[name]) delete errorsCopy[name];

        errorsRef.current = errorsCopy;
        return setErrors(errorsCopy);
      }
    }

    if (shouldUpdateState) setErrors(errors);
  }

  const removeEventListener = findRemovedFieldAndRemoveListener.bind(null, fieldsRef.current, validateAndStateUpdate);

  function registerIntoAllFields(elementRef, data = { required: false, validate: undefined }) {
    if (elementRef && !elementRef.name) return warnMissingRef(elementRef);

    const { name, type, value } = elementRef;
    const { required, validate } = data;
    const inputData = {
      ...data,
      ref: elementRef,
    };
    const fields = fieldsRef.current;
    const isRadio = isRadioInput(type);
    const field = fields[name];
    const existRadioOptionIndex =
      isRadio && field && Array.isArray(field.options) ? field.options.findIndex(({ ref }) => value === ref.value) : -1;

    if ((!isRadio && field) || (isRadio && existRadioOptionIndex > -1)) return;

    if (isRadio) {
      if (!field) fields[name] = { options: [], required, validate, ref: { type: 'radio', name } };
      if (validate) fields[name].validate = validate;

      (fields[name].options || []).push({
        ...inputData,
        mutationWatcher: onDomRemove(elementRef, () => removeEventListener(inputData, true)),
      });
    } else {
      fields[name] = {
        ...inputData,
        mutationWatcher: onDomRemove(elementRef, () => removeEventListener(inputData, true)),
      };
    }

    attachEventListeners({
      field: isRadio ? (fields[name].options || [])[(fields[name].options || []).length - 1] : fields[name],
      isRadio,
      validateAndStateUpdate,
    });
  }

  function watch(filedNames?: string | Array<string> | undefined, defaultValue?: string | Array<string> | undefined) {
    const watchFields = watchFieldsRef.current;

    if (typeof filedNames === 'string') {
      watchFields[filedNames] = true;
    } else if (Array.isArray(filedNames)) {
      filedNames.forEach(name => (watchFields[name] = true));
    } else {
      isWatchAllRef.current = true;
      watchFieldsRef.current = {};
    }

    const result = getFieldsValues(fieldsRef.current, filedNames);
    return result === undefined ? defaultValue : result;
  }

  function register(data: Ref | Function): any {
    if (!data) return;
    if (data.type) {
      if (!data.name) return warnMissingRef(data);
      registerIntoAllFields(data);
    }

    return ref => (ref ? registerIntoAllFields(ref, data) : () => {});
  }

  const handleSubmit = (callback: (Object, e) => void) => async e => {
    if (e) {
      e.preventDefault();
      e.persist();
    }
    let fieldErrors;
    let fieldValues;
    const fields = fieldsRef.current;
    const currentFieldValues = Object.values(fields);
    isSubmittedRef.current = true;

    if (validationSchema) {
      fieldValues = getFieldsValues(fields);
      fieldErrors = await validateWithSchema(validationSchema, fieldValues);

      if (fieldErrors === undefined) return callback(combineFieldValues(fieldValues), e);
    } else {
      const result: SubmitPromiseResult = await currentFieldValues.reduce(
        async (previous: Promise<SubmitPromiseResult>, field: IField) => {
          const resolvedPrevious = await previous;
          const {
            ref,
            ref: { name },
          } = field;

          if (!fields[name]) return Promise.resolve(resolvedPrevious);

          const fieldError = await validateField(field, fields);
          const hasError = fieldError && fieldError[name];

          if (!hasError) {
            resolvedPrevious.values[name] = getFieldValue(fields, ref);
            return Promise.resolve(resolvedPrevious);
          }

          resolvedPrevious.errors = { ...(resolvedPrevious.errors || {}), ...fieldError };
          return Promise.resolve(resolvedPrevious);
        },
        Promise.resolve({
          errors: {},
          values: {},
        }),
      );

      fieldErrors = result.errors;
      fieldValues = result.values;
    }

    if (Object.values(fieldErrors).length) {
      setErrors(fieldErrors);
      errorsRef.current = fieldErrors;
      return;
    }

    callback(combineFieldValues(fieldValues), e);
  };

  const unSubscribe = () => {
    fieldsRef.current &&
      Object.values(fieldsRef.current).forEach((field: IField) => {
        const { ref, options } = field;
        isRadioInput(ref.type) && Array.isArray(options)
          ? options.forEach(fieldRef => removeEventListener(fieldRef, true))
          : removeEventListener(field, true);
      });
    fieldsRef.current = {};
    watchFieldsRef.current = {};
    errorsRef.current = {};
    isWatchAllRef.current = false;
    isSubmittedRef.current = false;
    isDirtyRef.current = false;
    touchedFieldsRef.current = [];
    setErrors({});
  };

  useEffect(() => unSubscribe, [mode]);

  return {
    register,
    handleSubmit,
    errors,
    watch,
    unSubscribe,
    formState: {
      dirty: isDirtyRef.current,
      isSubmitted: isSubmittedRef.current,
      touched: touchedFieldsRef.current,
    },
  };
}
