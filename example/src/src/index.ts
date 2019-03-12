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

  function removeReference(ref: HTMLInputElement) {
    fields.current = findMissDomAndCLean({
      target: { ref },
      fields: fields.current,
      validateWithStateUpdate,
      forceDelete: true,
    });
    // mutationWatchList.current[ref.name].disconnect();
    // delete mutationWatchList.current[ref.name];
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

    if (type === 'radio') {
      if (!allFields[name]) {
        allFields[name] = { options: [], mutationWatchList: { options: [] }, required, ref: { type: 'radio', name } };
      }

      allFields[name].options.push(data);
      allFields[name].mutationWatchList.options.push(onDomRemove(ref, () => removeReference(ref)));
    } else {
      allFields[name] = data;
      allFields[name].mutationWatchList = onDomRemove(ref, () => removeReference(ref));
    }

    if (
      allFields[name].eventAttached ||
      (type === 'radio' && allFields[name].options.find(({ ref, eventAttached }) => eventAttached && name === ref.name))
    )
      return;

    if (mode === 'onChange' || allFields[ref.name].watch) {
      if (TEXT_INPUTS.includes(type)) {
        ref.addEventListener('input', validateWithStateUpdate);
      } else {
        const options = allFields[name].options;
        if (options) {
          const index = options.length - 1;
          if (!options[index].eventAttached) {
            options[index].ref.addEventListener('change', validateWithStateUpdate);
            options[index].eventAttached = true;
          }
        } else {
          ref.addEventListener('change', validateWithStateUpdate);
          allFields[name].eventAttached = true;
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

      allFields[data.ref.name].eventAttached = true;
    }
  }

  function watch(filedNames?: string | Array<string> | undefined) {
    if (typeof filedNames === 'string') {
      fields.current[filedNames].watch = true;
    } else if (Array.isArray(filedNames)) {
      filedNames.forEach(name => (fields.current[name].watch = true));
    } else {
      Object.values(fields.current).forEach(({ ref }: RegisterInput) => (fields.current[ref.name] = true));
    }

    return fields.current ? getFieldsValues(fields.current, filedNames) : undefined;
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
