import * as React from 'react';
import {
  InternalFieldName,
  FieldValues,
  FlatFieldErrors,
  Field,
  FieldName,
  FieldErrors,
  Resolver,
  FieldError,
  FieldRefs,
  FieldValue,
  UnpackNestedValue,
} from './types/form';
import shouldRenderBasedOnError from './logic/shouldRenderBasedOnError';
import isEmptyObject from './utils/isEmptyObject';
import { get } from './utils';
import unset from './utils/unset';
import isSameError from './utils/isSameError';
import set from './utils/set';
import isNullOrUndefined from './utils/isNullOrUndefined';
import validateField from './logic/validateField';
import getFieldArrayValueByName from './logic/getFieldArrayValueByName';
import isArray from './utils/isArray';
import getFieldsValues from './logic/getFieldsValues';
import { transformToNestObject } from './logic';
import { DeepPartial } from './types/utils';

interface UseFormValidatorProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
> {
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>;
  context: TContext | undefined;
  defaultValuesRef: React.MutableRefObject<
    | FieldValue<UnpackNestedValue<TFieldValues>>
    | UnpackNestedValue<DeepPartial<TFieldValues>>
  >;
  resolver: Resolver<TFieldValues, TContext> | undefined;
  validateAllFieldCriteria: boolean;
  reRender: () => void;
}

export function useFormValidator<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
>({
  fieldsRef,
  validateAllFieldCriteria,
  defaultValuesRef,
  resolver,
  context,
  reRender,
}: UseFormValidatorProps<TFieldValues, TContext>) {
  const errorsRef = React.useRef<FieldErrors<TFieldValues>>({});
  const validFieldsRef = React.useRef(
    new Set<InternalFieldName<TFieldValues>>(),
  );
  const fieldsWithValidationRef = React.useRef(
    new Set<InternalFieldName<TFieldValues>>(),
  );
  const isValidRef = React.useRef(true);
  const resolverRef = React.useRef(resolver);
  const contextRef = React.useRef(context);
  resolverRef.current = resolver;
  contextRef.current = context;

  const shouldRenderBaseOnError = React.useCallback(
    (
      name: InternalFieldName<TFieldValues>,
      error: FlatFieldErrors<TFieldValues>,
      shouldRender: boolean | null = false,
    ): boolean | void => {
      let shouldReRender =
        shouldRender ||
        shouldRenderBasedOnError<TFieldValues>({
          errors: errorsRef.current,
          error,
          name,
          validFields: validFieldsRef.current,
          fieldsWithValidation: fieldsWithValidationRef.current,
        });

      if (isEmptyObject(error)) {
        if (fieldsWithValidationRef.current.has(name) || resolverRef.current) {
          validFieldsRef.current.add(name);
          shouldReRender = shouldReRender || get(errorsRef.current, name);
        }

        errorsRef.current = unset(errorsRef.current, name);
      } else {
        const previousError = get(errorsRef.current, name);
        validFieldsRef.current.delete(name);
        shouldReRender =
          shouldReRender ||
          (previousError
            ? !isSameError(previousError, error[name] as FieldError)
            : true);

        set(errorsRef.current, name, error[name]);
      }

      if (shouldReRender && !isNullOrUndefined(shouldRender)) {
        reRender();
        return true;
      }
    },
    [reRender, errorsRef, fieldsWithValidationRef],
  );

  const executeValidation = React.useCallback(
    async (
      name: InternalFieldName<TFieldValues>,
      skipReRender?: boolean,
    ): Promise<boolean> => {
      if (fieldsRef.current[name]) {
        const error = await validateField<TFieldValues>(
          fieldsRef,
          validateAllFieldCriteria,
          fieldsRef.current[name] as Field,
        );

        shouldRenderBaseOnError(name, error, skipReRender ? null : false);

        return isEmptyObject(error);
      }

      return false;
    },
    [shouldRenderBaseOnError, validateAllFieldCriteria, fieldsRef],
  );

  const executeSchemaOrResolverValidation = React.useCallback(
    async (
      payload:
        | InternalFieldName<TFieldValues>
        | InternalFieldName<TFieldValues>[],
    ) => {
      const { errors } = await resolverRef.current!(
        getFieldArrayValueByName(fieldsRef.current),
        contextRef.current,
        validateAllFieldCriteria,
      );
      const previousFormIsValid = isValidRef.current;
      isValidRef.current = isEmptyObject(errors);

      if (isArray(payload)) {
        payload.forEach((name) => {
          const error = get(errors, name);

          if (error) {
            set(errorsRef.current, name, error);
          } else {
            unset(errorsRef.current, name);
          }
        });
        reRender();
      } else {
        const error = get(errors, payload);
        shouldRenderBaseOnError(
          payload,
          (error ? { [payload]: error } : {}) as FlatFieldErrors<TFieldValues>,
          previousFormIsValid !== isValidRef.current,
        );
      }

      return isEmptyObject(errorsRef.current);
    },
    [
      reRender,
      shouldRenderBaseOnError,
      validateAllFieldCriteria,
      isValidRef,
      contextRef,
      errorsRef,
      fieldsRef,
    ],
  );

  const trigger = React.useCallback(
    async (
      name?: FieldName<TFieldValues> | FieldName<TFieldValues>[],
    ): Promise<boolean> => {
      const fields = name || Object.keys(fieldsRef.current);

      if (resolverRef.current) {
        return executeSchemaOrResolverValidation(fields);
      }

      if (isArray(fields)) {
        const result = await Promise.all(
          fields.map(async (data) => await executeValidation(data, true)),
        );
        reRender();
        return result.every(Boolean);
      }

      return await executeValidation(fields);
    },
    [executeSchemaOrResolverValidation, executeValidation, reRender, fieldsRef],
  );

  const validateResolver = React.useCallback(
    (values: any = {}) => {
      const fieldValues = isEmptyObject(defaultValuesRef.current)
        ? getFieldsValues(fieldsRef.current)
        : defaultValuesRef.current;

      resolverRef.current!(
        transformToNestObject({
          ...fieldValues,
          ...values,
        }),
        contextRef.current,
        validateAllFieldCriteria,
      ).then(({ errors }) => {
        const previousFormIsValid = isValidRef.current;
        isValidRef.current = isEmptyObject(errors);

        if (previousFormIsValid !== isValidRef.current) {
          reRender();
        }
      });
    },
    [
      reRender,
      validateAllFieldCriteria,
      contextRef,
      fieldsRef,
      isValidRef,
      defaultValuesRef,
    ],
  );

  return {
    shouldRenderBaseOnError,
    trigger,
    validateResolver,
    errorsRef,
    isValidRef,
    validFieldsRef,
    resolverRef,
    contextRef,
    fieldsWithValidationRef,
  };
}
