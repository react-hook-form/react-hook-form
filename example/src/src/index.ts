import { useRef, useState, useEffect } from 'react';
import getFieldsValues from './logic/getFieldsValues';
import validateField from './logic/validateField';
import findMissDomAndCLean from './logic/findMissDomAndCLean';
import { TEXT_INPUTS } from './constants';
import detectRegistered from './logic/detectRegistered';
import getFieldValue from './logic/getFieldValue';
import removeAllEventListeners from './logic/removeAllEventListeners';
import onDomRemove from './utils/onDomRemove';

export interface RegisterInput {
  ref: any;
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (data: string | number) => boolean;
  minLength?: number;
  options?: Array<{
    ref: any;
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

      updateErrorMessage({ ...copy });
      localErrorMessages.current = { ...copy };
    }
  }

  function attachEventListeners({ optionIndex, ref, type }) {
    const allFields = fields.current;

    if (!allFields[name]) return;

    if (mode === 'onChange' || allFields[ref.name].watch) {
      if (type === 'radio') {
        const options = allFields[name].options;

        options[optionIndex].ref.addEventListener('change', validateWithStateUpdate);
        options[optionIndex].eventAttached = true;
      } else {
        ref.addEventListener('input', validateWithStateUpdate);
        allFields[name].eventAttached = true;
      }
    } else if (mode === 'onBlur') {
      if (type === 'radio') {
        const options = allFields[name].options;

        options[optionIndex].ref.addEventListener('blur', validateWithStateUpdate);
        options[optionIndex].eventAttached = true;
      } else {
        ref.addEventListener('blur', validateWithStateUpdate);
        allFields[name].eventAttached = true;
      }
    }
  }

  function removeReferenceAndEventListeners(ref: HTMLInputElement) {
    fields.current = findMissDomAndCLean({
      target: { ref },
      fields: fields.current,
      validateWithStateUpdate,
      forceDelete: true,
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
    if (allFields && detectRegistered(allFields, data)) return;

    if (type === 'radio') {
      if (!allFields[name]) {
        allFields[name] = { options: [], isMutationWatch: { options: [] }, required, ref: { type: 'radio', name } };
      }

      allFields[name].options.push(data);
      allFields[name].isMutationWatch.options.push(onDomRemove(ref, () => removeReferenceAndEventListeners(ref)));
    } else {
      allFields[name] = data;
      allFields[name].isMutationWatch = onDomRemove(ref, () => removeReferenceAndEventListeners(ref));
    }

    const optionIndex =
      type === 'radio' &&
      allFields[name].options.find(({ ref, eventAttached }) => eventAttached && value === ref.value);

    if (allFields[name].eventAttached || optionIndex >= 0) return;

    attachEventListeners({ optionIndex, ref, type });
  }

  function watch(filedNames?: string | Array<string> | undefined) {
    if (!fields.current) return undefined;

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
    const fieldsRef = fields.current;

    const { localErrors, values } = Object.values(fieldsRef).reduce(
      (previous: ErrorMessages, data: RegisterInput) => {
        const {
          ref,
          ref: { name, type },
          options,
        } = data;

        const result = findMissDomAndCLean({
          target: data,
          fields: fieldsRef,
          validateWithStateUpdate,
        });

        if (result) {
          fields.current = result;
          return previous;
        }

        const fieldError = validateField(data, fieldsRef);

        if (fieldError[name] && !fields.current[name].watch) {
          if (TEXT_INPUTS.includes(type)) {
            ref.addEventListener('input', validateWithStateUpdate);
          } else {
            if (options) {
              options.forEach(({ ref }) => {
                ref.addEventListener('change', validateWithStateUpdate);
              });
            } else {
              ref.addEventListener('change', validateWithStateUpdate);
            }
          }
        }

        previous.localErrors = { ...previous.localErrors, ...fieldError };

        if (previous.localErrors[name]) return previous;

        previous.values[name] = getFieldValue(fieldsRef, ref);

        return previous;
      },
      {
        localErrors: {},
        values: {},
      },
    );

    updateErrorMessage({ ...localErrors });
    localErrorMessages.current = { ...localErrors };

    if (!Object.values(localErrors).length) callback(values, e);
  };

  useEffect(
    () => () => {
      Array.isArray(fields.current) &&
        Object.values(fields.current).forEach(({ ref, options }: RegisterInput) => {
          if (options) {
            options.forEach(({ ref }) => {
              removeAllEventListeners(ref, validateWithStateUpdate);
            });
          } else {
            removeAllEventListeners(ref, validateWithStateUpdate);
          }
        });
    },
    [],
  );

  return {
    register,
    handleSubmit,
    errors,
    watch,
  };
}
