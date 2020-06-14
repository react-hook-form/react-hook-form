import * as React from 'react';
import {
  FieldValues,
  InternalFieldName,
  UnpackNestedValue,
  FieldValue,
  FieldRefs,
} from './types/form';
import isEmptyObject from './utils/isEmptyObject';
import isNameInFieldArray from './logic/isNameInFieldArray';
import isUndefined from './utils/isUndefined';
import getFieldsValues from './logic/getFieldsValues';
import { DeepPartial, LiteralToPrimitive } from './types/utils';
import isString from './utils/isString';
import assignWatchFields from './logic/assignWatchFields';
import { get } from './utils';
import isArray from './utils/isArray';
import { transformToNestObject } from './logic';

interface UseFormWatcher<TFieldValues extends FieldValues = FieldValues> {
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>;
  fieldArrayNamesRef: React.MutableRefObject<Set<string>>;
  defaultValuesRef: React.MutableRefObject<
    | FieldValue<UnpackNestedValue<TFieldValues>>
    | UnpackNestedValue<DeepPartial<TFieldValues>>
  >;
}

export function useFormWatcher<TFieldValues extends FieldValues = FieldValues>({
  fieldsRef,
  fieldArrayNamesRef,
  defaultValuesRef,
}: UseFormWatcher<TFieldValues>) {
  const isWatchAllRef = React.useRef(false);
  const watchFieldsRef = React.useRef(
    new Set<InternalFieldName<TFieldValues>>(),
  );
  const watchFieldsHookRef = React.useRef<
    Record<string, Set<InternalFieldName<TFieldValues>>>
  >({});
  const watchFieldsHookRenderRef = React.useRef<Record<string, Function>>({});

  const isFieldWatched = (name: string) =>
    isWatchAllRef.current ||
    watchFieldsRef.current.has(name) ||
    watchFieldsRef.current.has((name.match(/\w+/) || [])[0]);

  const renderWatchedInputs = (name: string, found = true): boolean => {
    if (!isEmptyObject(watchFieldsHookRef.current)) {
      for (const key in watchFieldsHookRef.current) {
        if (
          watchFieldsHookRef.current[key].has(name) ||
          !watchFieldsHookRef.current[key].size ||
          isNameInFieldArray(fieldArrayNamesRef.current, name)
        ) {
          watchFieldsHookRenderRef.current[key]();
          found = false;
        }
      }
    }

    return found;
  };

  const watchInternal = React.useCallback(
    (
      fieldNames?: string | string[],
      defaultValue?: unknown,
      watchId?: string,
    ) => {
      const watchFields = watchId
        ? watchFieldsHookRef.current[watchId]
        : watchFieldsRef.current;
      const combinedDefaultValues = isUndefined(defaultValue)
        ? defaultValuesRef.current
        : defaultValue;
      const fieldValues = getFieldsValues<TFieldValues>(
        fieldsRef.current,
        fieldNames,
      );

      if (isString(fieldNames)) {
        return assignWatchFields<TFieldValues>(
          fieldValues,
          fieldNames,
          watchFields,
          isUndefined(defaultValue)
            ? get(combinedDefaultValues, fieldNames)
            : (defaultValue as UnpackNestedValue<DeepPartial<TFieldValues>>),
          true,
        );
      }

      if (isArray(fieldNames)) {
        return fieldNames.reduce(
          (previous, name) => ({
            ...previous,
            [name]: assignWatchFields<TFieldValues>(
              fieldValues,
              name,
              watchFields,
              combinedDefaultValues as UnpackNestedValue<
                DeepPartial<TFieldValues>
              >,
            ),
          }),
          {},
        );
      }

      if (isUndefined(watchId)) {
        isWatchAllRef.current = true;
      }

      return transformToNestObject(
        (!isEmptyObject(fieldValues) && fieldValues) ||
          (combinedDefaultValues as FieldValues),
      );
    },
    [fieldsRef, defaultValuesRef, isWatchAllRef],
  );

  function watch(): UnpackNestedValue<TFieldValues>;
  function watch<
    TFieldName extends string,
    TFieldValue extends TFieldValues[TFieldName]
  >(
    name: TFieldName,
    defaultValue?: UnpackNestedValue<LiteralToPrimitive<TFieldValue>>,
  ): UnpackNestedValue<LiteralToPrimitive<TFieldValue>>;
  function watch<TFieldName extends keyof TFieldValues>(
    names: TFieldName[],
    defaultValues?: UnpackNestedValue<
      DeepPartial<Pick<TFieldValues, TFieldName>>
    >,
  ): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
  function watch(
    names: string[],
    defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): UnpackNestedValue<DeepPartial<TFieldValues>>;
  function watch(
    fieldNames?: string | string[],
    defaultValue?: unknown,
  ): unknown {
    return watchInternal(fieldNames, defaultValue);
  }

  return {
    isWatchAllRef,
    watchFieldsRef,
    watchFieldsHookRef,
    watchFieldsHookRenderRef,
    isFieldWatched,
    renderWatchedInputs,
    watchInternal,
    watch,
  };
}
