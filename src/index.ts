import { useRef, useState, useEffect } from 'react';
import getFieldsValues from './logic/getFieldsValues';
import validateField from './logic/validateField';
import findMissDomAndClean from './logic/findMissDomAndClean';
import getFieldValue from './logic/getFieldValue';
import removeAllEventListeners from './logic/removeAllEventListeners';
import onDomRemove from './utils/onDomRemove';
import isRadioInput from './utils/isRadioInput';
import attachEventListeners from './logic/attachEventListeners';

export interface RegisterInput {
  ref: HTMLInputElement | HTMLSelectElement | null;
  required?: boolean;
  min?: number | Date;
  max?: number | Date;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (data: string | number) => boolean;
  minLength?: number;
}

type Validate = (data: string | number) => boolean;

export interface Field {
  ref: any;
  required?: boolean;
  min?: number | Date;
  max?: number | Date;
  maxLength?: number;
  pattern?: RegExp;
  validate?: Validate | { [key: string]: Validate };
  minLength?: number;
  eventAttached?: boolean;
  watch?: boolean;
  mutationWatcher?: any;
  options?: Array<{
    ref: any;
    eventAttached?: boolean;
    mutationWatcher?: any;
  }>;
}

export interface ErrorMessages {
  [key: string]: { string: boolean } | {};
}

export default function useForm({ mode }: { mode: 'onSubmit' | 'onBlur' | 'onChange' } = { mode: 'onSubmit' }) {
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
      ref: { name, type, value },
    } = data;

    const allFields = fields.current;

    if (isRadioInput(type)) {
      if (!allFields[name]) {
        allFields[name] = { options: [], required, ref: { type: 'radio', name } };
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
      allFields[name] = data;
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

        if (!fields.current[name]) return previous;

        const fieldError = validateField(data, allFields);
        const hasError = fieldError && fieldError[name];

        if (!hasError) {
          previous.values[name] = getFieldValue(allFields, ref);
          return previous;
        }

        if (!fields.current[name].eventAttached) {
          if (isRadioInput(type) && Array.isArray(options)) {
            options.forEach(option => {
              if (option.eventAttached) return;
              option.ref.addEventListener('change', validateWithStateUpdate);
              option.eventAttached = true;
            });
          } else {
            ref.addEventListener('input', validateWithStateUpdate);
            data.eventAttached = true;
          }
        }

        previous.localErrors = { ...previous.localErrors, ...fieldError };
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
