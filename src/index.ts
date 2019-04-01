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
  const fields = useRef<{ [key: string]: Field }>({});
  const localErrorMessages = useRef<ErrorMessages>({});
  const watchFields = useRef<{ [key: string]: boolean }>({});
  const [errors, updateErrorMessage] = useState<ErrorMessages>({});

  async function validateWithStateUpdate({ target: { name }, type }: any) {
    const ref = fields.current[name];
    const error = await validateField(ref, fields.current);

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

  function registerIntoAllFields(elementRef: any, data: any = {}) {
    if (elementRef && !elementRef.name) {
      console.warn('Oops missing the name for field:', elementRef);
      return;
    }

    const inputData = {
      ...data,
      ref: elementRef,
    };

    let radioOptionIndex;
    const {
      ref,
      required,
      validate,
      ref: { name, type, value },
    } = inputData;

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
      const isInitialCreate = !allFields[name];
      allFields[name] = {
        ...allFields[name],
        ...inputData,
      };
      if (isInitialCreate) {
        allFields[name].mutationWatcher = onDomRemove(ref, () => removeReferenceAndEventListeners(inputData, true));
      }
    }

    attachEventListeners({
      allFields,
      watchFields,
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
    e.persist();
    const allFields = fields.current;
    let localErrors;
    let values;
    let result;

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
      const allFieldsValues = Object.values(allFields);
      result = await new Promise(resolve =>
        allFieldsValues.reduce(
          async (previous: any, data: Field, index: number) => {
            const resolvedPrevious = await previous;
            const {
              ref,
              ref: { name, type },
              options,
            } = data;
            const lastChild = allFieldsValues.length - 1 === index;

            removeReferenceAndEventListeners(data);

            if (!fields.current[name]) return lastChild ? resolve(resolvedPrevious) : resolvedPrevious;

            const fieldError = await validateField(data, allFields);
            const hasError = fieldError && fieldError[name];

            if (!hasError) {
              resolvedPrevious.values[name] = getFieldValue(allFields, ref);
              return lastChild ? resolve(resolvedPrevious) : resolvedPrevious;
            }

            if (isRadioInput(type) && Array.isArray(options)) {
              options.forEach(option => {
                if (option.eventAttached && option.eventAttached.includes('change')) return;
                option.ref.addEventListener('change', validateWithStateUpdate);
                option.eventAttached = [...(option.eventAttached || []), 'change'];
              });
              // @ts-ignore
            } else if (!fields.current[name].eventAttached || !fields.current[name].eventAttached.includes('input')) {
              ref.addEventListener('input', validateWithStateUpdate);
              data.eventAttached = [...(data.eventAttached || []), 'input'];
            }

            resolvedPrevious.localErrors = { ...(resolvedPrevious.localErrors || []), ...fieldError };
            return lastChild ? resolve(resolvedPrevious) : resolvedPrevious;
          },
          Promise.resolve({
            localErrors: {},
            values: {},
          }),
        ),
      );

      localErrors = result.localErrors;
      values = result.values;
    }

    if (JSON.stringify(omitRefs(localErrorMessages.current)) !== JSON.stringify(omitRefs(localErrors))) {
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
