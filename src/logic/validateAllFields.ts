import validateField from './validateField';
import getFieldValue from './getFieldValue';
import isRadioInput from '../utils/isRadioInput';
import { Field } from '../index';

export default async function validateAllFields({
  previous,
  data,
  index,
  fieldsLength,
  resolve,
  allFields,
  removeReferenceAndEventListeners,
  validateWithStateUpdate,
}: {
  allFields: { [key: string]: Field };
  removeReferenceAndEventListeners: (Field) => void;
  validateWithStateUpdate: (any) => void;
  fieldsLength: number;
  previous: Promise<{
    values: { [key: string]: any },
    errors: { [key: string]: any },
  }>;
  data: Field;
  index: number;
  resolve: any;
}) {
  const resolvedPrevious = await previous;
  const {
    ref,
    ref: { name, type },
    options,
  } = data;
  const lastChild = fieldsLength - 1 === index;

  removeReferenceAndEventListeners(data);

  if (!allFields[name]) return lastChild ? resolve(resolvedPrevious) : resolvedPrevious;

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
  } else if (!data.eventAttached || !data.eventAttached.includes('input')) {
    ref.addEventListener('input', validateWithStateUpdate);
    data.eventAttached = [...(data.eventAttached || []), 'input'];
  }

  resolvedPrevious.errors = { ...(resolvedPrevious.errors || []), ...fieldError };
  return lastChild ? resolve(resolvedPrevious) : resolvedPrevious;
}
