import { useRef, useState, useEffect } from 'react';
import getFieldsValues from './logic/getFieldsValues';
import validateField from './logic/validateField';
import findMissDomAndClean from './logic/findMissDomAndClean';
import getFieldValue from './logic/getFieldValue';
import removeAllEventListeners from './logic/removeAllEventListeners';
import onDomRemove from './utils/onDomRemove';
import isRadioInput from './utils/isRadioInput';
import attachEventListeners from './logic/attachEventListeners';
import validateWithSchema from './logic/validateWithSchema';

type Validate = (data: string | number) => boolean | string | number | Date;

type NumberOrString = number | string;

type Props = { mode: 'onSubmit' | 'onBlur' | 'onChange'; validationSchema?: any };

export interface RegisterInput {
  ref: HTMLInputElement | HTMLSelectElement | null;
  required?: boolean | string;
  min?: NumberOrString | { value: NumberOrString; message: string };
  max?: NumberOrString | { value: NumberOrString; message: string };
  maxLength?: number | { value: number; message: string };
  minLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  validate?:
    | Validate
    | { [key: string]: Validate }
    | { value: Validate | { [key: string]: Validate }; message: string };
}

export interface Field extends RegisterInput {
  ref: any;
  eventAttached?: Array<string>;
  watch?: boolean;
  mutationWatcher?: any;
  options?: Array<{
    ref: any;
    eventAttached?: Array<string>;
    mutationWatcher?: any;
  }>;
}

export interface ErrorMessages {
  [key: string]:
    | {
        ref: any;
        message: string | boolean;
        type: string;
      }
    | {};
}

export default function useForm(
  { mode, validationSchema }: Props = {
    mode: 'onSubmit',
  },
) {
  const fields = useRef<{ [key: string]: Field }>({});
  const localErrorMessages = useRef<ErrorMessages>({});
  const watchFields = useRef<{ [key: string]: boolean }>({});
  const [errors, updateErrorMessage] = useState<ErrorMessages>({});

  function validateWithStateUpdate({ target: { name }, type }: any) {
    const ref = fields.current[name];
    const error = validateField(ref, fields.current);

    if (
      localErrorMessages.current[name] !== error[name] ||
      mode === 'onChange' ||
      (mode === 'onBlur' && type === 'blur') ||
      watchFields.current[name]
    ) {
      const copy = { ...localErrorMessages.current, ...error };

      if (!error[name]) delete copy[name];

      localErrorMessages.current = copy;
      updateErrorMessage(copy);
    }
  }

  function removeReferenceAndEventListeners(data, forceDelete = false) {
    findMissDomAndClean({
      target: data,
      fields: fields.current,
      validateWithStateUpdate,
      forceDelete,
    });
  }

  function register(data: RegisterInput) {
    if (!data || !data.ref) return;
    if (!data.ref.name) {
      console.warn('Oops missing the name for field:', data.ref);
      return;
    }

    let radioOptionIndex;
    const {
      ref,
      required,
      validate,
      ref: { name, type, value },
    } = data;

    const allFields = fields.current;

    if (isRadioInput(type)) {
      if (!allFields[name]) {
        allFields[name] = { options: [], required, validate, ref: { type: 'radio', name } };
      }

      if (!allFields[name].validate && validate) {
        allFields[name].validate = validate;
      }

      const options = allFields[name].options || [];
      radioOptionIndex = options.findIndex(({ ref }) => value === ref.value);

      if (radioOptionIndex > -1) {
        options[radioOptionIndex] = {
          ...options[radioOptionIndex],
          ...data,
        };
      } else {
        options.push({
          ...data,
          mutationWatcher: onDomRemove(ref, () => removeReferenceAndEventListeners(data, true)),
        });
        radioOptionIndex = options.length - 1;
      }
    } else {
      allFields[name] = {
        ...allFields[name],
        ...data,
      };
      if (!allFields[name]) {
        allFields[name].mutationWatcher = onDomRemove(ref, () => removeReferenceAndEventListeners(data, true));
      }
    }

    attachEventListeners({ allFields, watchFields, ref, type, radioOptionIndex, name, mode, validateWithStateUpdate });
  }

  function watch(filedNames?: string | Array<string> | undefined, defaultValue?: string | Array<string> | undefined) {
    if (typeof filedNames === 'string') {
      if (!watchFields.current[filedNames]) watchFields.current[filedNames] = true;
    } else if (Array.isArray(filedNames)) {
      filedNames.forEach(name => {
        if (!watchFields.current[name]) return;
        watchFields.current[name] = true;
      });
    } else {
      Object.values(fields.current).forEach(({ ref }: RegisterInput) => {
        if (!ref) return;
        if (!watchFields.current[ref.name]) return;
        watchFields.current[ref.name] = true;
      });
    }

    const result = getFieldsValues(fields.current, filedNames);
    return result === undefined ? defaultValue : result;
  }

  const handleSubmit = (callback: (Object, e) => void) => async e => {
    e.preventDefault();
    const allFields = fields.current;
    let localErrors;
    let values;

    if (validationSchema) {
      values = Object.values(allFields).reduce((previous, { ref }) => {
        previous[ref.name] = getFieldValue(allFields, ref);
        return previous;
      }, {});
      localErrors = await validateWithSchema(validationSchema, values);

      if (localErrors === undefined) {
        callback(values, e);
        return;
      }
    } else {
      const result = Object.values(allFields).reduce(
        (previous: ErrorMessages, data: Field) => {
          const {
            ref,
            ref: { name, type },
            options,
          } = data;

          removeReferenceAndEventListeners(data);

          if (!fields.current[name]) return previous;

          const fieldError = validateField(data, allFields);
          const hasError = fieldError && fieldError[name];

          if (!hasError) {
            previous.values[name] = getFieldValue(allFields, ref);
            return previous;
          }

          if (isRadioInput(type) && Array.isArray(options)) {
            options.forEach(option => {
              if (option.eventAttached && option.eventAttached.includes('change')) return;
              option.ref.addEventListener('change', validateWithStateUpdate);
              option.eventAttached = [...option.eventAttached, 'change'];
            });
          } else if (fields.current[name].eventAttached && !fields.current[name].eventAttached.includes('input')) {
            ref.addEventListener('input', validateWithStateUpdate);
            data.eventAttached = [...(data.eventAttached || []), 'input'];
          }

          previous.localErrors = { ...(previous.localErrors || []), ...fieldError };
          return previous;
        },
        {
          localErrors: {},
          values: {},
        },
      );

      localErrors = result.localErrors;
      values = result.values;
    }

    // if (JSON.stringify(localErrorMessages.current) !== JSON.stringify(localErrors)) {
    updateErrorMessage(localErrors);
    localErrorMessages.current = localErrors;
    // }

    if (!Object.values(localErrors).length) callback(values, e);
  };

  useEffect(
    () => () => {
      fields.current &&
        Object.values(fields.current).forEach(
          ({ ref, options }: Field) =>
            isRadioInput(ref.type) && Array.isArray(options)
              ? options.forEach(({ ref }) => removeAllEventListeners(ref, validateWithStateUpdate))
              : removeAllEventListeners(ref, validateWithStateUpdate),
        );
      fields.current = {};
      watchFields.current = {};
      localErrorMessages.current = {};
      updateErrorMessage({});
    },
    [mode],
  );

  return {
    register,
    handleSubmit,
    errors,
    watch,
  };
}
