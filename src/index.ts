import { useRef, useState, useEffect } from 'react';
import getFieldsValues from './logic/getFieldsValues';
import validateField from './logic/validateField';
import findMissDomAndClean from './logic/findMissDomAndClean';
import { TEXT_INPUTS } from './constants';
import detectRegistered from './logic/detectRegistered';
import getFieldValue from './logic/getFieldValue';
import removeAllEventListeners from './logic/removeAllEventListeners';
import onDomRemove from './utils/onDomRemove';
import isRadioInput from './utils/isRadioInput';
import attachEventListeners from './logic/attachEventListeners';
import getOptionNonEventAttached from './logic/getOptionNonEventAttached';

export interface RegisterInput {
  ref: any;
  required?: boolean;
  min?: number | Date;
  max?: number | Date;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (data: string | number) => boolean;
  minLength?: number;
}

export interface Field {
  ref: any;
  required?: boolean;
  min?: number | Date;
  max?: number | Date;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (data: string | number) => boolean;
  minLength?: number;
  eventAttached?: boolean;
  mutationWatcher?: boolean;
  options?: Array<{
    ref: any;
    eventAttached?: boolean;
    mutationWatcher?: boolean;
  }>;
}

interface ErrorMessages {
  [key: string]: { [key: string]: boolean };
}

export default function useForm({ mode }: { mode: 'onSubmit' | 'onBlur' | 'onChange' } = { mode: 'onSubmit' }) {
  const fields = useRef<{ [key: string]: any }>({});
  const localErrorMessages = useRef<ErrorMessages>({});
  const [errors, updateErrorMessage] = useState<ErrorMessages>({});

  function validateWithStateUpdate({ target: { name }, type }: any) {
    const ref = fields.current[name];
    const error = validateField(ref, fields.current);

    if (
      localErrorMessages.current[name] !== error[name] ||
      mode === 'onChange' ||
      (mode === 'onBlur' && type === 'blur') ||
      fields.current[name].watch
    ) {
      const copy = { ...localErrorMessages.current, ...error };

      if (!error[name]) delete copy[name];

      updateErrorMessage(copy);
      localErrorMessages.current = copy;
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

    const {
      ref,
      required,
      ref: { name, type, value },
    } = data;

    const allFields = fields.current;
    if (detectRegistered(allFields, data)) return;

    if (isRadioInput(type)) {
      if (!allFields[name]) {
        allFields[name] = { options: [], required, ref: { type: 'radio', name } };
      }

      allFields[name].options.push({
        ...data,
        mutationWatcher: onDomRemove(ref, () => removeReferenceAndEventListeners(data, true)),
      });
    } else {
      allFields[name] = data;
      allFields[name].mutationWatcher = onDomRemove(ref, () => removeReferenceAndEventListeners(data, true));
    }

    const radioOptionIndex = getOptionNonEventAttached(allFields[name], type, value);

    if (allFields[name].eventAttached || radioOptionIndex < 0) return;

    attachEventListeners({ allFields, ref, type, radioOptionIndex, name, mode, validateWithStateUpdate });
  }

  function watch(filedNames?: string | Array<string> | undefined) {
    if (typeof filedNames === 'string' && fields.current[filedNames]) {
      fields.current[filedNames].watch = true;
    } else if (Array.isArray(filedNames)) {
      filedNames.forEach(name => {
        if (!fields.current[name]) return;
        fields.current[name].watch = true;
      });
    } else {
      Object.values(fields.current).forEach(({ ref }: RegisterInput) => {
        if (!fields.current[name]) return;
        fields.current[ref.name] = true;
      });
    }

    return getFieldsValues(fields.current, filedNames);
  }

  const handleSubmit = (callback: (Object, e) => void) => e => {
    e.preventDefault();
    const allFields = fields.current;

    const { localErrors, values } = Object.values(allFields).reduce(
      (previous: ErrorMessages, data: Field) => {
        const {
          ref,
          ref: { name, type },
          options,
        } = data;

        removeReferenceAndEventListeners(data);

        if (!fields.current[name]) {
          return previous;
        }

        const fieldError = validateField(data, allFields);
        const hasError = fieldError[name];

        if (hasError && !fields.current[name].watch) {
          if (TEXT_INPUTS.includes(type)) {
            ref.addEventListener('input', validateWithStateUpdate);
          } else {
            if (Array.isArray(options)) {
              options.forEach(({ ref }) => ref.addEventListener('change', validateWithStateUpdate));
            } else {
              ref.addEventListener('change', validateWithStateUpdate);
            }
          }
        }

        if (hasError) {
          previous.localErrors = { ...previous.localErrors, ...fieldError };
          return previous;
        }

        previous.values[name] = getFieldValue(allFields, ref);
        return previous;
      },
      {
        localErrors: {},
        values: {},
      },
    );

    if (JSON.stringify(localErrorMessages.current) !== JSON.stringify(localErrors)) {
      updateErrorMessage(localErrors);
      localErrorMessages.current = localErrors;
    }

    if (!Object.values(localErrors).length) callback(values, e);
  };

  useEffect(
    () => () => {
      fields.current &&
        Object.values(fields.current).forEach(({ ref, options }: Field) => {
          if (options) {
            options.forEach(({ ref }) => {
              removeAllEventListeners(ref, validateWithStateUpdate);
            });
          } else {
            removeAllEventListeners(ref, validateWithStateUpdate);
          }
        });
      fields.current = {};
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
