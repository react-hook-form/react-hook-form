import { useRef, useState, useEffect } from 'react';
import getValidRadioValue from './getValidRadioValue';
import getFieldValues from './getFieldsValue';
import validateField from './validateField';
import getMultipleSelectValue from './getMultipleSelectValue';
import detectRegistered from './detectRegistered';

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

    if (
      [
        'text',
        'email',
        'date',
        'time',
        'datetime',
        'datetime-local',
        'month',
        'week',
        'password',
        'search',
        'tel',
        'number',
        'url',
      ].includes(type)
    ) {
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

  function findMissDomAndCLean(data, fields) {
    if (data.ref.type === 'radio') {
      return data.options.reduce((previous, { ref }) => {
        if (!document.body.contains(ref)) {
          ref.removeEventListener('input', validateWithStateUpdate);
          ref.removeEventListener('change', validateWithStateUpdate);
          delete fields[ref.name];
          return true;
        }
        return previous;
      }, false);
    } else if (data.ref && !document.body.contains(data.ref)) {
      data.ref.removeEventListener('input', validateWithStateUpdate);
      data.ref.removeEventListener('change', validateWithStateUpdate);
      delete fields[data.ref.name];
      return true;
    }
  }

  function select(filedName?: string) {
    if (!fields.current) return null;
    const results = getFieldValues(fields.current, filedName);

    // if object need a good flat
    return typeof results === 'object' ? results : results;
  }

  const prepareSubmit = (callback: any) => (e: any) => {
    let localError = {};
    const values = {};
    e.preventDefault();

    Object.values(fields.current).forEach((data: any) => {
      const { ref } = data;

      if (findMissDomAndCLean(data, fields.current)) return;

      // required section
      localError = validateField(data, fields.current, localError);

      if (localError[ref.name]) return;

      if (ref.type === 'checkbox') {
        values[ref.name] = ref.checked;
      } else if (ref.type === 'select-multiple') {
        values[ref.name] = getMultipleSelectValue([...ref.options]);
      } else if (ref.type === 'radio') {
        values[ref.name] = getValidRadioValue(fields.current[ref.name].options).value;
      } else {
        values[ref.name] = ref.value;
      }
    });

    updateErrorMessage({ ...localError });
    localErrorMessages.current = { ...localError };

    if (!Object.values(localError).length) callback(values);
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

  return {
    register,
    prepareSubmit,
    errors,
    select,
  };
}
