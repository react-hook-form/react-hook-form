import { useRef, useState, useEffect } from 'react';
import getFieldsValues from './logic/getFieldsValues';
import validateField from './logic/validateField';
import findDomElmAndClean from './logic/findDomElmAndClean';
import { TEXT_INPUTS } from './constants';
import detectRegistered from './logic/detectRegistered';
import getFieldValue from './logic/getFieldValue';

export interface RegisterInput {
  ref: HTMLInputElement;
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (data: string | number) => boolean;
  minLength?: number;
  options?: Array<{
    ref: HTMLInputElement;
  }>;
}

export default function useForm(
  { validateMode }: { validateMode: 'onSubmit' | 'onBlur' | 'onChange' } = { validateMode: 'onSubmit' },
) {
  const fields = useRef({});
  const watchList = useRef({});
  const localErrorMessages = useRef({});
  const [errors, updateErrorMessage] = useState({});

  function validateWithStateUpdate(e: any) {
    const ref = fields.current[e.target.name];
    const error = validateField(ref, fields.current);

    if (
      localErrorMessages.current[e.target.name] !== error[e.target.name] ||
      validateMode === 'onChange' ||
      (validateMode === 'onBlur' && e.type === 'blur')
    ) {
      const copy = { ...localErrorMessages.current };
      delete copy[e.target.name];

      updateErrorMessage({ ...copy });
      localErrorMessages.current = { ...copy };
    }
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
      options,
      ref: { name, type },
    } = data;

    if (fields.current && detectRegistered(fields.current, data)) return;

    if (type === 'radio') {
      if (!fields.current[name]) fields.current[name] = { options: [], required, ref: { type: 'radio', name } };
      fields.current[name].options.push(data);
    } else {
      fields.current[name] = data;
    }

    if (!fields.current[name].eventAttched) {
      if (validateMode === 'onChange' || watchList.current[ref.name]) {
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

        fields.current[name].eventAttched = true;
      } else if (validateMode === 'onBlur') {
        if (options) {
          options.forEach(({ ref }) => {
            ref.addEventListener('blur', validateWithStateUpdate);
          });
        } else {
          ref.addEventListener('blur', validateWithStateUpdate);
        }

        fields.current[data.ref.name].eventAttched = true;
      }
    }
  }

  function watch(filedName?: string) {
    if (typeof filedName === 'string') {
      watchList.current[filedName] = true;
    } else if (Array.isArray(filedName)) {
      filedName.forEach(name => {
        watchList.current[name] = true;
      });
    } else {
      Object.values(fields.current).forEach(({ ref }: any) => {
        watchList.current[ref.name] = true;
      });
    }

    return !fields.current ? undefined : getFieldsValues(fields.current, filedName);
  }

  const prepareSubmit = (callback: (Object) => void) => (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    const fieldsRef = fields.current;
    console.log(fieldsRef);

    const { localErrors, values } = Object.values(fieldsRef).reduce(
      (previous: any, data: any) => {
        const {
          ref,
          ref: { name, type },
          options,
        } = data;

        if (findDomElmAndClean(data, fieldsRef, validateWithStateUpdate)) return previous;

        const fieldError = validateField(data, fieldsRef);

        if (fieldError[name] && !watchList.current[name]) {
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

    if (!Object.values(localErrors).length) callback(values);
  };

  useEffect(
    () => () => {
      const removeEventListeners = ref => {
        ref.removeEventListener('input', validateWithStateUpdate);
        ref.removeEventListener('change', validateWithStateUpdate);
        ref.removeEventListener('blur', validateWithStateUpdate);
      };
      Array.isArray(fields.current) &&
        Object.values(fields.current).forEach(({ ref, options }: RegisterInput) => {
          if (options) {
            options.forEach(({ ref }) => {
              removeEventListeners(ref);
            });
          } else {
            removeEventListeners(ref);
          }
        });
    },
    [],
  );

  return {
    register,
    prepareSubmit,
    errors,
    watch,
  };
}
