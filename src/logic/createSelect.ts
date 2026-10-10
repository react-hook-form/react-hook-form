import type {
  Control,
  FieldValues,
  FormState,
  UseFormReturn,
  UseFormSelect,
} from '../types';
import get from '../utils/get';
import isFunction from '../utils/isFunction';
import isObject from '../utils/isObject';
import isString from '../utils/isString';
import isUndefined from '../utils/isUndefined';
import set from '../utils/set';

import getProxyFormState from './getProxyFormState';

type Scope = {
  control: Control<any, any, any>;
  path: string;
};

type Names = string | readonly string[] | undefined;

type SelectMethods = Omit<UseFormReturn<any, any, any>, 'formState' | 'select'>;

type Method = (...args: any[]) => any;

const scopes = new WeakMap<object, Scope>();

const SCOPED_KEYS = [
  'errors',
  'dirtyFields',
  'touchedFields',
  'validatingFields',
];

export const getScope = <TControl>(control: TControl) =>
  (control && scopes.get(control)) as
    | { control: TControl; path: string }
    | undefined;

export const joinName = (path: string, name?: string | number) =>
  isUndefined(name) || name === '' ? path : `${path}.${name}`;

export const scopeNames = <T extends Names>(path: string, names: T): T =>
  (Array.isArray(names)
    ? names.map((name) => joinName(path, name))
    : joinName(path, names as string | undefined)) as T;

export const scopeDefaultValue = (
  path: string,
  names: Names,
  defaultValue: unknown,
) =>
  Array.isArray(names) && !isUndefined(defaultValue)
    ? nest(path, defaultValue)
    : defaultValue;

const nest = (path: string, value: unknown) => {
  const result = {};
  set(result, path, value);
  return result;
};

const relativeName = (path: string, name?: string) =>
  name === path
    ? ''
    : name && name.startsWith(path + '.')
      ? name.slice(path.length + 1)
      : undefined;

const hasTrue = (value: unknown): boolean =>
  isObject(value) || Array.isArray(value)
    ? Object.values(value).some(hasTrue)
    : !!value;

export const scopeFormState = <T extends Record<string, any>>(
  formState: T,
  path: string,
): T => {
  const result = {} as T;
  const empty = {};

  for (const key of Object.getOwnPropertyNames(formState)) {
    Object.defineProperty(result, key, {
      enumerable: Object.prototype.propertyIsEnumerable.call(formState, key),
      get: () =>
        SCOPED_KEYS.includes(key)
          ? get(formState[key], path) || empty
          : key === 'isDirty' || key === 'isValidating'
            ? hasTrue(
                get(
                  formState[
                    key === 'isDirty' ? 'dirtyFields' : 'validatingFields'
                  ],
                  path,
                ),
              )
            : key === 'defaultValues' || key === 'values'
              ? get(formState[key], path)
              : key === 'name'
                ? relativeName(path, formState.name)
                : formState[key],
    });
  }

  return result;
};

const createSelection = (
  methods: SelectMethods,
  path: string,
  select: (name?: string | number) => unknown,
) => {
  const control = methods.control;
  const isName = (value: unknown): value is string | readonly string[] =>
    isString(value) || Array.isArray(value);
  const scoped =
    (method: Method) =>
    (...args: unknown[]) =>
      method(
        isName(args[0]) ? scopeNames(path, args[0]) : path,
        ...(isName(args[0]) || isUndefined(args[0]) ? args.slice(1) : args),
      );
  const register = scoped(methods.register);
  const setError = scoped(methods.setError);
  const getFieldState = (name?: unknown, formState?: FormState<FieldValues>) =>
    isString(name) && formState
      ? methods.getFieldState(name, formState)
      : methods.getFieldState(joinName(path, name as string));
  const unregister = (name?: unknown, options?: unknown) =>
    isName(name)
      ? methods.unregister(scopeNames(path, name), options as never)
      : methods.unregister(
          [...control._names.mount].filter((fieldName) =>
            isUndefined(relativeName(path, fieldName)) ? 0 : 1,
          ),
          name as never,
        );
  const scopedControl = Object.create(control, {
    register: { value: register },
    unregister: { value: unregister },
    getFieldState: { value: getFieldState },
    setError: { value: setError },
  });

  scopes.set(scopedControl, { control, path });

  return {
    name: path,
    select: (name: string | number) => select(joinName(path, name)),
    control: scopedControl,
    get formState() {
      return scopeFormState(getFormState(control), path);
    },
    register,
    unregister,
    setError,
    getFieldState,
    getValues: scoped(methods.getValues),
    getErrors: scoped(methods.getErrors),
    clearErrors: scoped(methods.clearErrors),
    trigger: scoped(methods.trigger),
    resetField: scoped(methods.resetField),
    setFocus: scoped(methods.setFocus),
    setValue: (name: string, value: unknown, options?: object) =>
      methods.setValue(joinName(path, name), value, options),
    setValues: (
      values: FieldValues | ((values: FieldValues) => FieldValues),
      options?: object,
    ) => {
      const current = methods.getValues(path);

      methods.setValue(
        path,
        { ...current, ...(isFunction(values) ? values(current) : values) },
        options,
      );
    },
    watch: (name?: unknown, defaultValue?: unknown) =>
      isFunction(name)
        ? methods.watch((values, info) => {
            const relative = relativeName(path, info.name);

            (!info.name ||
              !isUndefined(relative) ||
              path.startsWith(info.name + '.')) &&
              name(get(values, path), { ...info, name: relative });
          })
        : (methods.watch as Method)(
            scopeNames(path, isName(name) ? name : undefined),
            scopeDefaultValue(path, name as Names, defaultValue),
          ),
    subscribe: (props: Parameters<UseFormReturn['subscribe']>[0]) =>
      methods.subscribe({
        ...props,
        name: scopeNames(path, props.name),
        callback: (data) =>
          props.callback(scopeFormState(data, path) as typeof data),
      }),
  };
};

const getFormState = (control: Control<any, any, any>) =>
  getProxyFormState(
    {
      ...control._formState,
      defaultValues: control._defaultValues,
    },
    control,
  );

export default <TFieldValues extends FieldValues, TContext, TTransformedValues>(
  formMethods: Omit<
    UseFormReturn<TFieldValues, TContext, TTransformedValues>,
    'formState' | 'select'
  >,
): UseFormSelect<TFieldValues, TContext, TTransformedValues> => {
  const methods = formMethods as unknown as SelectMethods;
  const cache = new Map<string, unknown>();

  const root = {
    ...methods,
    name: '',
    select: (name: string | number) => select(name),
    get formState() {
      return getFormState(methods.control);
    },
  };
  const select = (name?: string | number) => {
    const path = isUndefined(name) ? '' : String(name);

    if (!cache.has(path)) {
      cache.set(path, path ? createSelection(methods, path, select) : root);
    }

    return cache.get(path);
  };

  return select as UseFormSelect<TFieldValues, TContext, TTransformedValues>;
};
