import combineFieldValues from './logic/combineFieldValues';
import getFieldsValues from './logic/getFieldsValues';
import getFieldValue from './logic/getFieldValue';
import validateField from './logic/validateField';
import validateWithSchema from './logic/validateWithSchema';
import {
  Field,
  SubmitPromiseResult,
  OnSubmit,
} from './types';
import filterUndefinedErrors from './utils/filterUndefinedErrors';
import isEmptyObject from './utils/isEmptyObject';

export default <Data>(
  callback: OnSubmit<Data>,
  {
    fieldsRef,
    validationFields,
    isSubmittingRef,
    reRenderForm,
    validationSchema,
    errorsRef,
    isSubmittedRef,
    submitCountRef,
  },
) => async (e: React.SyntheticEvent): Promise<void> => {
  if (e) {
    e.preventDefault();
    e.persist();
  }
  let fieldErrors;
  let fieldValues;
  const fields = fieldsRef.current;
  const currentFieldValues = validationFields
    ? (validationFields.map(name => fieldsRef.current[name]) as [])
    : Object.values(fields);
  isSubmittingRef.current = true;
  reRenderForm({});

  if (validationSchema) {
    fieldValues = getFieldsValues(fields);
    fieldErrors = await validateWithSchema(validationSchema, fieldValues);
  } else {
    // @ts-ignore
    const {
      errors,
      values,
    }: SubmitPromiseResult<Data> = await currentFieldValues.reduce(
      async (
        previous: Promise<SubmitPromiseResult<Data>>,
        field: Field,
      ): Promise<SubmitPromiseResult<Data>> => {
        const resolvedPrevious = await previous;
        const {
          ref,
          ref: { name },
        } = field;

        if (!fields[name]) return Promise.resolve(resolvedPrevious);

        const fieldError = await validateField(field, fields);

        if (fieldError[name]) {
          resolvedPrevious.errors = {
            ...(resolvedPrevious.errors || {}),
            ...fieldError,
          };
          return Promise.resolve(resolvedPrevious);
        }

        resolvedPrevious.values[name] = getFieldValue(fields, ref);
        return Promise.resolve(resolvedPrevious);
      },
      Promise.resolve<SubmitPromiseResult<Data>>({
        errors: {},
        values: {},
      } as any),
    );

    fieldErrors = {
      ...errors,
      ...filterUndefinedErrors(errorsRef.current),
    };
    fieldValues = values;
  }

  if (isEmptyObject(fieldErrors)) {
    await callback(combineFieldValues(fieldValues), e);
  } else {
    errorsRef.current = fieldErrors;
  }
  isSubmittedRef.current = true;
  submitCountRef.current += 1;
  isSubmittingRef.current = false;
  reRenderForm({});
};
