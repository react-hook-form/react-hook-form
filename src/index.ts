import { useRef, useState, useEffect } from 'react';
import getFieldsValues from './logic/getFieldsValues';
import validateField from './logic/validateField';
import findMissDomAndClean from './logic/findMissDomAndClean';
import getFieldValue from './logic/getFieldValue';
import onDomRemove from './utils/onDomRemove';
import isRadioInput from './utils/isRadioInput';
import attachEventListeners from './logic/attachEventListeners';
import validateWithSchema from './logic/validateWithSchema';
import combineFieldValues from './logic/combineFieldValues';

type Validate = (data: string | number) => boolean | string | number | Date;

type NumberOrString = number | string;

type Props = { mode: 'onSubmit' | 'onBlur' | 'onChange'; validationSchema?: any };

type MutationWatcher = {
  disconnect: () => void;
};

export type Ref = any;

export interface IRegisterInput {
  ref: Ref;
  required?: boolean | string;
  min?: NumberOrString | { value: NumberOrString; message: string };
  max?: NumberOrString | { value: NumberOrString; message: string };
  maxLength?: number | { value: number; message: string };
  minLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  validate?:
    | Validate
    | { [key: string]: Validate }
    | { value: Validate | { [key: string]: Validate }; message: string }
    | undefined;
}

export interface IField extends IRegisterInput {
  ref: Ref;
  watch?: boolean;
  mutationWatcher?: MutationWatcher;
  fields?: Array<IRegisterInput>;
  options?: Array<{
    ref: Ref;
    mutationWatcher?: MutationWatcher;
  }>;
}

type Error = {
  ref: Ref;
  message: string | boolean;
  type: string;
};

export interface IErrorMessages {
  [key: string]: Error;
}

export default function useForm(
  { mode, validationSchema }: Props = {
    mode: 'onSubmit',
  },
) {
  const fieldsRef = useRef<{ [key: string]: IField }>({});
  const errorMessagesRef = useRef<IErrorMessages>({});
  const isWatchAllRef = useRef<boolean>(false);
  const watchFieldsRef = useRef<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<IErrorMessages>({});
  const isSubmitted = useRef<boolean>(false);
  const isDirty = useRef<boolean>(false);
  const touched = useRef<Array<string>>([]);

  async function validateAndStateUpdate({ target: { name }, type }: any) {
    const ref = fieldsRef.current[name];
    const errorMessages = errorMessagesRef.current;
    let shouldUpdateState = false;

    if (!isDirty.current) {
      isDirty.current = true;
      shouldUpdateState = true;
    }

    if (!touched.current.includes(name)) {
      touched.current.push(name);
      shouldUpdateState = true;
    }

    if (!isSubmitted.current && mode === 'onSubmit' && (isWatchAllRef.current || watchFieldsRef.current[name])) {
      setErrors({});
      return;
    }

    const error = await validateField(ref, fieldsRef.current);

    if (
      error !== errorMessages ||
      mode === 'onChange' ||
      (mode === 'onBlur' && type === 'blur') ||
      watchFieldsRef.current[name] ||
      isWatchAllRef.current
    ) {
      const copy = { ...errorMessages, ...error };

      if (!error[name]) delete copy[name];

      errorMessagesRef.current = copy;
      setErrors(copy);
      return;
    }

    if (shouldUpdateState) {
      setErrors(errorMessages);
    }
  }

  const removeReferenceAndEventListeners = findMissDomAndClean.bind(null, fieldsRef.current, validateAndStateUpdate);

  function registerIntoAllFields(elementRef, data = { required: false, validate: undefined }) {
    if (elementRef && !elementRef.name) {
      console.warn('Oops missing the name for field:', elementRef);
      return;
    }

    let radioOptionIndex;
    const inputData = {
      ...data,
      ref: elementRef,
    };
    const {
      ref,
      required,
      validate,
      ref: { name, type, value },
    } = inputData;
    const fields = fieldsRef.current;
    const isRadio = isRadioInput(type);

    if (isRadio) {
      if (!fields[name]) {
        fields[name] = { options: [], required, validate, ref: { type: 'radio', name } };
      }

      if (!fields[name].validate && validate) {
        fields[name].validate = validate;
      }

      const options = fields[name].options || [];
      radioOptionIndex = options.findIndex(({ ref }) => value === ref.value);

      if (radioOptionIndex > -1) {
        options[radioOptionIndex] = {
          ...options[radioOptionIndex],
          ...inputData,
        };
      } else {
        options.push({
          ...inputData,
          mutationWatcher: onDomRemove(ref, () => removeReferenceAndEventListeners(inputData, true)),
        });
        radioOptionIndex = options.length - 1;
      }
    } else {
      const isInitialCreate = !fields[name];

      fields[name] = {
        ...fields[name],
        ...inputData,
      };

      if (isInitialCreate) {
        fields[name].mutationWatcher = onDomRemove(ref, () => removeReferenceAndEventListeners(inputData, true));
      }
    }

    attachEventListeners({
      field: fields[name],
      watchFields: watchFieldsRef.current,
      isRadio,
      radioOptionIndex,
      isWatchAll: isWatchAllRef.current,
      mode,
      validateAndStateUpdate,
    });
  }

  function watch(filedNames?: string | Array<string> | undefined, defaultValue?: string | Array<string> | undefined) {
    const watchFields = watchFieldsRef.current;

    if (typeof filedNames === 'string') {
      if (!watchFields[filedNames]) watchFields[filedNames] = true;
    } else if (Array.isArray(filedNames)) {
      filedNames.forEach(name => {
        watchFields[name] = true;
      });
    } else {
      isWatchAllRef.current = true;
    }

    const result = getFieldsValues(fieldsRef.current, filedNames);
    return result === undefined ? defaultValue : result;
  }

  function register(data: Ref) {
    if (!data) return;
    if (data.type) {
      if (!data.name) console.warn('Oops missing the name for field:', data);
      registerIntoAllFields(data);
    }
    if (fieldsRef.current[data.name]) return;

    return ref => {
      if (ref) registerIntoAllFields(ref, data);
    };
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
    isSubmitted.current = true;

    if (validationSchema) {
      fieldValues = currentFieldValues.reduce((previous, { ref }) => {
        previous[ref.name] = getFieldValue(fields, ref);
        return previous;
      }, {});
      fieldErrors = await validateWithSchema(validationSchema, fieldValues);

      if (fieldErrors === undefined) {
        callback(combineFieldValues(fieldValues), e);
        return;
      }
    } else {
      const result: {
        errors: { [key: string]: Error };
        values: { [key: string]: number | string | boolean };
      } = await currentFieldValues.reduce(
        async (previous: any, field: IField) => {
          const resolvedPrevious = await previous;
          const {
            ref,
            ref: { name, type },
            options,
          } = field;

          if (!fields[name]) return Promise.resolve(resolvedPrevious);

          const fieldError = await validateField(field, fields);
          const hasError = fieldError && fieldError[name];

          if (!hasError) {
            resolvedPrevious.values[name] = getFieldValue(fields, ref);
            return Promise.resolve(resolvedPrevious);
          }

          if (isRadioInput(type)) {
            if (Array.isArray(options)) {
              options.forEach(option => {
                option.ref.addEventListener('change', validateAndStateUpdate);
              });
            }
          } else {
            ref.addEventListener('input', validateAndStateUpdate);
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
      errorMessagesRef.current = fieldErrors;
      return;
    }

    callback(combineFieldValues(fieldValues), e);
  };

  useEffect(
    () => () => {
      fieldsRef.current &&
        Object.values(fieldsRef.current).forEach((field: IField) => {
          const { ref, options } = field;
          isRadioInput(ref.type) && Array.isArray(options)
            ? options.forEach(fieldRef => removeReferenceAndEventListeners(fieldRef, true))
            : removeReferenceAndEventListeners(field, true);
        });
      fieldsRef.current = {};
      watchFieldsRef.current = {};
      errorMessagesRef.current = {};
      isWatchAllRef.current = false;
      isSubmitted.current = false;
      isDirty.current = false;
      touched.current = [];
      setErrors({});
    },
    [mode],
  );

  return {
    register,
    handleSubmit,
    errors,
    watch,
    dirty: isDirty.current,
    isSubmitted: isSubmitted.current,
    touched: touched.current,
  };
}
