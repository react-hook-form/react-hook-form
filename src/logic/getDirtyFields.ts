import deepEqual from '../utils/deepEqual';
import isNullOrUndefined from '../utils/isNullOrUndefined';
import isObject from '../utils/isObject';
import isPrimitive from '../utils/isPrimitive';
import isUndefined from '../utils/isUndefined';
import objectHasFunction from '../utils/objectHasFunction';

type DirtyContainer = Record<string, unknown>;

function isTraversable(value: unknown): value is DirtyContainer {
  return Array.isArray(value) || (isObject(value) && !objectHasFunction(value));
}

function isRegisteredLeaf(fieldRef: unknown): boolean {
  return !!(fieldRef && '_f' in (fieldRef as object));
}

function createDirtyContainer(value: unknown): DirtyContainer {
  return (Array.isArray(value) ? [] : {}) as DirtyContainer;
}

function getChild(value: unknown, key: string): unknown {
  return (value as DirtyContainer)[key];
}

function isEmptyDirtyContainer(value: DirtyContainer): boolean {
  return Array.isArray(value)
    ? !value.some((item) => !isUndefined(item))
    : !Object.keys(value).length;
}

function clearDirtyField(container: DirtyContainer, key: string) {
  if (Array.isArray(container)) {
    container[key] = undefined;
  } else {
    delete container[key];
  }
}

function markFieldsDirty(
  data: unknown,
  fields: DirtyContainer = {},
  fieldRefs?: unknown,
) {
  for (const key in data as DirtyContainer) {
    const value = getChild(data, key);
    const fieldRef = fieldRefs && getChild(fieldRefs, key);

    if (
      isTraversable(value) &&
      (!Array.isArray(value) || !isRegisteredLeaf(fieldRef))
    ) {
      const child = createDirtyContainer(value);
      fields[key] = child;
      markFieldsDirty(value, child, fieldRef);

      if (isEmptyDirtyContainer(child)) {
        clearDirtyField(fields, key);
      }
    } else if (!isUndefined(value)) {
      fields[key] = true;
    }
  }

  return fields;
}

export default function getDirtyFields(
  data: unknown,
  formValues: unknown,
  dirtyFieldsFromValues?: DirtyContainer,
  fieldRefs?: unknown,
): DirtyContainer {
  const dirtyFields =
    dirtyFieldsFromValues ||
    markFieldsDirty(formValues, createDirtyContainer(formValues), fieldRefs);

  for (const key in data as DirtyContainer) {
    const value = getChild(data, key);
    const fieldRef = fieldRefs && getChild(fieldRefs, key);

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
          isNullOrUndefined(formValues) ? {} : getChild(formValues, key),
          dirtyFields[key] as DirtyContainer,
          fieldRef,
        );
      }

      if (isEmptyDirtyContainer(dirtyFields[key] as DirtyContainer)) {
        clearDirtyField(dirtyFields, key);
      }
    } else if (deepEqual(value, getChild(formValues, key))) {
      clearDirtyField(dirtyFields, key);
    } else {
      dirtyFields[key] = true;
    }
  }

  return dirtyFields;
}
