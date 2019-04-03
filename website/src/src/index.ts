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
import omitRefs from './utils/omitRefs';
import validateAllFields from './logic/validateAllFields';

type Validate = (data: string | number) => boolean | string | number | Date;

type NumberOrString = number | string;

type Props = { mode: 'onSubmit' | 'onBlur' | 'onChange'; validationSchema?: any };

type Ref = HTMLInputElement | HTMLSelectElement | null;

export interface RegisterInput {
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
    | { value: Validate | { [key: string]: Validate }; message: string };
}

export interface Field extends RegisterInput {
  ref: any;
  eventAttached?: Array<string>;
  watch?: boolean;
  mutationWatcher?: any;
  fields?: Array<any>;
  options?: Array<{
    ref: any;
    eventAttached?: Array<string>;
    mutationWatcher?: any;
  }>;
}

type Error = {
  ref: Ref;
  message: string | boolean;
  type: string;
};

export interface ErrorMessages {
  [key: string]: Error | {};
}

export default function useForm(
  { mode, validationSchema }: Props = {
    mode: 'onSubmit',
  },
) {
  const fieldsRef = useRef<{ [key: string]: Field }>({});
  const errorMessagesRef = useRef<ErrorMessages>({});
  const watchFieldsRef = useRef<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<ErrorMessages>({});

  async function validateWithStateUpdate({ target: { name }, type }: any) {
    const ref = fieldsRef.current[name];
    const error = await validateField(ref, fieldsRef.current);
    const errorMessage = errorMessagesRef.current;

    if (
      errorMessage[name] !== error[name] ||
      mode === 'onChange' ||
      (mode === 'onBlur' && type === 'blur') ||
      watchFieldsRef.current[name]
    ) {
      const copy = { ...errorMessage, ...error };

      if (!error[name]) delete copy[name];

      errorMessagesRef.current = copy;
      setErrors(copy);
    }
  }

  function removeReferenceAndEventListeners(data, forceDelete = false) {
    findMissDomAndClean({
      target: data,
      fields: fieldsRef.current,
      validateWithStateUpdate,
      forceDelete,
    });
  }

  function registerIntoAllFields(elementRef: any, data: any = {}) {
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

    if (isRadioInput(type)) {
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
      fields,
      watchFields: watchFieldsRef,
      ref,
      type,
      radioOptionIndex,
      name,
      mode,
      validateWithStateUpdate,
    });
  }

  function register(data: any) {
    if (!data) return;
    if (data instanceof HTMLElement) {
      registerIntoAllFields(data);
    }

    return ref => {
      if (ref) {
        registerIntoAllFields(ref, data);
      }
    };
  }

  function watch(filedNames?: string | Array<string> | undefined, defaultValue?: string | Array<string> | undefined) {
    const watchFields = watchFieldsRef.current;

    if (typeof filedNames === 'string') {
      if (!watchFields[filedNames]) watchFields[filedNames] = true;
    } else if (Array.isArray(filedNames)) {
      filedNames.forEach(name => {
        if (!watchFields[name]) return;
        watchFields[name] = true;
      });
    } else {
      Object.values(fieldsRef.current).forEach(({ ref }: RegisterInput) => {
        if (!ref || !watchFields[ref.name]) return;
        watchFields[ref.name] = true;
      });
    }

    const result = getFieldsValues(fieldsRef.current, filedNames);
    return result === undefined ? defaultValue : result;
  }

  const handleSubmit = (callback: (Object, e) => void) => async e => {
    e.preventDefault();
    e.persist();
    let fieldErrors;
    let fieldValues;
    const fields = fieldsRef.current;
    const currentFieldValues = Object.values(fields);
    const fieldsLength = currentFieldValues.length;

    if (validationSchema) {
      fieldValues = currentFieldValues.reduce((previous, { ref }) => {
        previous[ref.name] = getFieldValue(fields, ref);
        return previous;
      }, {});
      fieldErrors = await validateWithSchema(validationSchema, fieldValues);

      if (fieldErrors === undefined) {
        callback(fieldValues, e);
        return;
      }
    } else {
      const result: { errors: any; values: any } = await new Promise(resolve =>
        currentFieldValues.reduce(
          async (previous: any, [name, data]: any, index: number) => {
            return await validateAllFields({
              previous,
              data,
              index,
              fieldsLength,
              allFields: fields,
              removeReferenceAndEventListeners,
              validateWithStateUpdate,
              resolve,
            });
          },
          Promise.resolve({
            errors: {},
            values: {},
          }),
        ),
      );

      fieldErrors = result.errors;
      fieldValues = result.values;
    }

    if (JSON.stringify(omitRefs(errorMessagesRef.current)) !== JSON.stringify(omitRefs(fieldErrors))) {
      setErrors(fieldErrors);
      errorMessagesRef.current = fieldErrors;
    }

    if (!Object.values(fieldErrors).length) callback(fieldValues, e);
  };

  useEffect(
    () => () => {
      fieldsRef.current &&
        Object.values(fieldsRef.current).forEach(
          ({ ref, options }: Field) =>
            isRadioInput(ref.type) && Array.isArray(options)
              ? options.forEach(({ ref }) => removeAllEventListeners(ref, validateWithStateUpdate))
              : removeAllEventListeners(ref, validateWithStateUpdate),
        );
      fieldsRef.current = {};
      watchFieldsRef.current = {};
      errorMessagesRef.current = {};
      setErrors({});
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
