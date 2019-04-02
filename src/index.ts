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
import getArrayFields from './logic/getArrayFields';
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

    let radioOptionIndex;
    let tempField;
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
    const allFields = fields.current;
    const index = getArrayFields(name, allFields);
    console.log('index', index)

    if (index >= 0 && !allFields[name]) {
      // @ts-ignore
      allFields[name] = [];
    }

    if (isRadioInput(type)) {
      if (!allFields[name]) {
        tempField = { options: [], required, validate, ref: { type: 'radio', name } };
        if (index >= 0) {
          allFields[name][index] = tempField;
        } else {
          allFields[name] = tempField;
        }
      }

      if (!allFields[name].validate && validate) {
        if (index >= 0) {
          allFields[name][index].validate = validate;
        } else {
          allFields[name].validate = validate;
        }
      }

      const options = index >= 0 ? allFields[name][index].options : allFields[name].options || [];
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
      tempField = {
        ...allFields[name],
        ...inputData,
      };

      if (index >= 0) {
        allFields[name][index] = tempField;
      } else {
        allFields[name] = tempField;
      }

      if (isInitialCreate) {
        if (index >= 0) {
          allFields[name][index].mutationWatcher = onDomRemove(ref, () =>
            removeReferenceAndEventListeners(inputData, true),
          );
        } else {
          allFields[name].mutationWatcher = onDomRemove(ref, () => removeReferenceAndEventListeners(inputData, true));
        }
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
      const fieldsEntries = Object.entries(allFields);
      const defaultResolver = Promise.resolve({
        localErrors: {},
        values: {},
      });
      result = await new Promise(resolve =>
        fieldsEntries.reduce(
          async (previous: any, [name, data]: any, index: number) => {
            if (Array.isArray(data.fields)) {
              previous[name] = await new Promise(arrayFieldResolve =>
                data.fields.reduce(
                  async (previous: any, data: Field, index: number) => {
                    return await validateAllFields({
                      previous,
                      data,
                      index,
                      resolve: arrayFieldResolve,
                      fieldsEntries,
                      allFields,
                      removeReferenceAndEventListeners,
                      validateWithStateUpdate,
                    });
                  },
                  defaultResolver,
                ),
              );
              return previous;
            } else {
              return await validateAllFields({
                previous,
                data,
                index,
                fieldsEntries,
                resolve,
                allFields,
                removeReferenceAndEventListeners,
                validateWithStateUpdate,
              });
            }
          },
          defaultResolver,
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
