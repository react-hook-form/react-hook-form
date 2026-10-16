import type { FieldRefs } from '../types';
import deepEqual from '../utils/deepEqual';
import isNullOrUndefined from '../utils/isNullOrUndefined';
import isObject from '../utils/isObject';
import isPrimitive from '../utils/isPrimitive';
import isUndefined from '../utils/isUndefined';
import objectHasFunction from '../utils/objectHasFunction';

function isTraversable<T>(value: T): boolean {
  return Array.isArray(value) || (isObject(value) && !objectHasFunction(value));
}

function isRegisteredLeaf(fieldRef: unknown): boolean {
  return !!(fieldRef && '_f' in (fieldRef as object));
}

type DirtyFieldsTree = Record<string, unknown>;

const createDirtyContainer = (value: unknown) =>
  (Array.isArray(value) ? [] : {}) as DirtyFieldsTree;

function isEmptyDirtyContainer(value: unknown): boolean {
  return Array.isArray(value)
    ? !value.some((item) => !isUndefined(item))
    : !Object.keys(value as DirtyFieldsTree).length;
}

function clearDirtyField(container: DirtyFieldsTree, key: string) {
  if (Array.isArray(container)) {
    container[key] = undefined;
  } else {
    delete container[key];
  }
}

function markFieldsDirty<T>(
  data: T,
  fields: DirtyFieldsTree = {},
  fieldRefs?: FieldRefs,
): DirtyFieldsTree {
  for (const key in data) {
    const value = data[key];
    const fieldRef = fieldRefs && (fieldRefs[key] as FieldRefs | undefined);

    if (
      isTraversable(value) &&
      (!Array.isArray(value) || !isRegisteredLeaf(fieldRef))
    ) {
      fields[key] = createDirtyContainer(value);
      markFieldsDirty(value, fields[key] as DirtyFieldsTree, fieldRef);

      if (isEmptyDirtyContainer(fields[key])) {
        clearDirtyField(fields, key);
      }
    } else if (!isUndefined(value)) {
      fields[key] = true;
    }
  }

  return fields;
}

export default function getDirtyFields<T>(
  data: T,
  formValues: T,
  dirtyFieldsFromValues?: DirtyFieldsTree,
  fieldRefs?: FieldRefs,
): DirtyFieldsTree {
  const dirtyFields =
    dirtyFieldsFromValues ||
    markFieldsDirty(
      formValues,
      createDirtyContainer(isNullOrUndefined(formValues) ? data : formValues),
      fieldRefs,
    );

  for (const key in data) {
    const value = data[key];
    const fieldRef = fieldRefs && (fieldRefs[key] as FieldRefs | undefined);

    if (
      isTraversable(value) &&
      (!Array.isArray(value) || !isRegisteredLeaf(fieldRef))
    ) {
      if (isUndefined(formValues) || isPrimitive(dirtyFields[key])) {
        dirtyFields[key] = markFieldsDirty(
          value,
          createDirtyContainer(value),
          fieldRef,
        );
      } else {
        getDirtyFields(
          value,
          isNullOrUndefined(formValues) ? {} : formValues[key],
          dirtyFields[key] as DirtyFieldsTree,
          fieldRef,
        );
      }

      if (isEmptyDirtyContainer(dirtyFields[key])) {
        clearDirtyField(dirtyFields, key);
      }
    } else if (
      deepEqual(
        value,
        isNullOrUndefined(formValues) ? undefined : formValues[key],
      )
    ) {
      clearDirtyField(dirtyFields, key);
    } else {
      dirtyFields[key] = true;
    }
  }

  return dirtyFields;
}
