import { useRef, useState, useEffect } from 'react';
import getFieldsValues from './logic/getFieldsValues';
import validateField from './logic/validateField';
import findDomElmAndClean from './logic/findDomElmAndClean';
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
    ref: HTMLInputElement;
  }>;
}

export default function useForm({ mode }: { mode: 'onSubmit' | 'onBlur' | 'onChange' } = { mode: 'onSubmit' }) {
  const fields = useRef<{ [key: string]: any }>({});
  const watchList = useRef({});
  const mutationWatchList = useRef<{ [key: string]: MutationObserver }>({});
  const localErrorMessages = useRef({});
  const [errors, updateErrorMessage] = useState({});

  function validateWithStateUpdate(e: any) {
    const { name } = e.target;
    const ref = fields.current[name];
    const error = validateField(ref, fields.current);

    if (
      localErrorMessages.current[name] !== error[name] ||
      mode === 'onChange' ||
      (mode === 'onBlur' && e.type === 'blur') ||
      watchList.current[name]
    ) {
      const copy = { ...localErrorMessages.current, ...error };
      if (!error[name]) {
        delete copy[name];
      }

      updateErrorMessage({ ...copy });
      localErrorMessages.current = { ...copy };
    }
  }

  function removeReference(ref) {
    fields.current = findDomElmAndClean({ ref }, fields.current, validateWithStateUpdate, true);
    delete mutationWatchList.current[ref.name];
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
    const allFields = fields.current;
    if (allFields && detectRegistered(allFields, data)) return;

    if (!mutationWatchList.current[name]) {
      mutationWatchList.current[name] = onDomRemove(ref, () => removeReference(ref));
    }

    if (type === 'radio') {
      if (!allFields[name]) allFields[name] = { options: [], required, ref: { type: 'radio', name } };
      allFields[name].options.push(data);
    } else {
      allFields[name] = data;
    }

    if (allFields[name].eventAttched) return;

    if (mode === 'onChange' || watchList.current[ref.name]) {
      if (TEXT_INPUTS.includes(type)) {
        ref.addEventListener('input', validateWithStateUpdate);
      } else {
        const options = allFields[name].options;
        if (options) {
          const index = options.length - 1;
          if (!options[index].eventAttched) {
            options[index].ref.addEventListener('change', validateWithStateUpdate);
            options[index].eventAttched = true;
          }
        } else {
          ref.addEventListener('change', validateWithStateUpdate);
          allFields[name].eventAttched = true;
        }
      }
    } else if (mode === 'onBlur') {
      if (options) {
        options.forEach(({ ref }) => {
          ref.addEventListener('blur', validateWithStateUpdate);
        });
      } else {
        ref.addEventListener('blur', validateWithStateUpdate);
      }

      allFields[data.ref.name].eventAttched = true;
    }
  }

  function watch(filedName?: string | Array<string>) {
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

  const handleSubmit = (callback: (Object, e) => void) => e => {
    e.preventDefault();
    const fieldsRef = fields.current;

    const { localErrors, values } = Object.values(fieldsRef).reduce(
      (previous: any, data: any) => {
        const {
          ref,
          ref: { name, type },
          options,
        } = data;

        const result = findDomElmAndClean(data, fieldsRef, validateWithStateUpdate);
        if (result) {
          fields.current = result;
          return previous;
        }

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

    if (!Object.values(localErrors).length) callback(values, e);
  };

  useEffect(
    () => () => {
      Object.values(mutationWatchList.current[name]).forEach(observer => {
        observer.disconnect();
      });

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
