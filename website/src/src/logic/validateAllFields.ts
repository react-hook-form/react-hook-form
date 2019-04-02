import validateField from './validateField';
import getFieldValue from './getFieldValue';
import isRadioInput from '../utils/isRadioInput';
import { Field } from '../index';

export default async function validateAllFields({
  previous,
  data,
  index,
  allFieldsValues,
  removeReferenceAndEventListeners,
  validateWithStateUpdate,
  resolve,
  allFields,
  arrayFieldName = '',
}: {
  arrayFieldName?: string;
  allFieldsValues: any;
  allFields: any;
  previous: any;
  data: Field;
  index: number;
  removeReferenceAndEventListeners: any;
  validateWithStateUpdate: any;
  resolve: any;
}) {
  const resolvedPrevious = await previous;
  const {
    ref,
    ref: { name, type },
    options,
  } = data;
  const lastChild = allFieldsValues.length - 1 === index;

  removeReferenceAndEventListeners(data);

  if (!allFields[name] && !allFields[arrayFieldName]) return lastChild ? resolve(resolvedPrevious) : resolvedPrevious;

  const fieldError = await validateField(data, allFields);

  const hasError = fieldError && fieldError[name];

  console.log(name);
  if (name.includes('bill')) {
    console.log('fucked', fieldError);
  }

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
  } else if (!allFields[name].eventAttached || !allFields[name].eventAttached.includes('input')) {
    ref.addEventListener('input', validateWithStateUpdate);
    data.eventAttached = [...(data.eventAttached || []), 'input'];
  }

  resolvedPrevious.localErrors = { ...(resolvedPrevious.localErrors || []), ...fieldError };
  return lastChild ? resolve(resolvedPrevious) : resolvedPrevious;
}
