import { useRef, useState, useEffect } from 'react';
import getValidRadioValue from './getValidRadioValue';
import getFieldValues from './getFieldsValue';
import validateField from './validateField';
import getMultipleSelectValue from './getMultipleSelectValue';
import detectRegistered from './detectRegistered';
import findDomElmAndClean from './findDomElmAndClean';
import { TEXT_INPUTS } from './constants';

export interface RegisterInput {
  ref: any;
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (any) => boolean;
  minLength?: number;
  options?: Array<any>;
}

export default function useForm() {
  const fields = useRef({});
  const localErrorMessages = useRef({});
  const [errors, updateErrorMessage] = useState({});

  function validateWithStateUpdate(e: React.ChangeEvent<HTMLInputElement>) {
    const ref = fields.current[e.target.name];
    const error = validateField(ref, fields.current);

    // need more thoughts on this one
    // if (localErrorMessages.current[e.target.name] && !Object.keys(error).length) {
    const copy = { ...localErrorMessages.current };
    delete copy[e.target.name];

    updateErrorMessage({ ...copy });
    localErrorMessages.current = { ...copy };
    // }
  }

  function register(data: any) {
    if (!data || !data.ref) return;
    if (!data.ref.name) {
      console.warn('Oops missing the name for field:', data.ref);
      return;
    }

    if (fields.current && fields.current[data.ref.name]) return; // need to work on the radio button here

    const {
      ref,
      required,
      ref: { name, type },
    } = data;

    if (TEXT_INPUTS.includes(type)) {
      ref.addEventListener('input', validateWithStateUpdate);
    } else {
      ref.addEventListener('change', validateWithStateUpdate);
    }
    if (!fields.current) fields.current = {};

    if (type === 'radio') {
      if (!fields.current[name]) fields.current[name] = { options: [], required, ref: { type: 'radio', name } };
      fields.current[name].options.push(data);
    } else {
      fields.current[name] = data;
    }
  }

  function select(filedName?: string) {
    return !fields.current ? undefined : getFieldValues(fields.current, filedName);
  }

  const prepareSubmit = (callback: (Object) => void) => (e: any) => {
    e.preventDefault();

    const { localErrors, values } = Object.values(fields.current).reduce(
      (previous: any, data: any) => {
        const { ref } = data;

        if (findDomElmAndClean(data, fields.current, validateWithStateUpdate)) return previous;

        // required section
        previous.localErrors = { ...previous.localErrors, ...validateField(data, fields.current) };

        if (previous.localErrors[ref.name]) return previous;

        if (ref.type === 'checkbox') {
          previous.values[ref.name] = ref.checked;
        } else if (ref.type === 'select-multiple') {
          previous.values[ref.name] = getMultipleSelectValue([...ref.options]);
        } else if (ref.type === 'radio') {
          previous.values[ref.name] = getValidRadioValue(fields.current[ref.name].options).value;
        } else {
          previous.values[ref.name] = ref.value;
        }

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
    () => () =>
      Array.isArray(fields.current) &&
      Object.values(fields.current).forEach(({ ref }: any) => {
        ref.removeEventListener('input', validateWithStateUpdate);
        ref.removeEventListener('change', validateWithStateUpdate);
      }),
    [],
  );

  console.log('errors', errors)

  return {
    register,
    prepareSubmit,
    errors,
    select,
  };
}
