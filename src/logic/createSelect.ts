import type {
  Control,
  ErrorOption,
  FieldValues,
  FormState,
  GetValuesConfig,
  RegisterOptions,
  SetFocusOptions,
  SetValueConfig,
  TriggerConfig,
  UseFormReturn,
  UseFormSelect,
} from '../types';
import cloneObject from '../utils/cloneObject';
import deepEqual from '../utils/deepEqual';
import get from '../utils/get';
import isFunction from '../utils/isFunction';
import isObject from '../utils/isObject';
import isString from '../utils/isString';
import isUndefined from '../utils/isUndefined';
import set from '../utils/set';

import getProxyFormState from './getProxyFormState';
import shouldSubscribeByName from './shouldSubscribeByName';

type Scope = {
  control: Control<any, any, any>;
  path: string;
};

type Names = string | readonly string[] | undefined;

type SelectMethods = Omit<UseFormReturn<any, any, any>, 'formState' | 'select'>;

type Method = (...args: any[]) => any;

const scopes = new WeakMap<object, Scope>();

export const resolveScope = <TControl, TName extends Names>(
  control: TControl,
  name: TName,
): [TControl, TName, string?] => {
  const scope = control && scopes.get(control);

  return scope
    ? [scope.control as TControl, scopeNames(scope.path, name), scope.path]
    : [control, name];
};

export const joinName = (path: string, name?: string | number) =>
  isUndefined(name) || name === '' ? path : `${path}.${name}`;

export const scopeNames = <T extends Names>(path: string, names: T): T =>
  (Array.isArray(names)
    ? names.map((name) => joinName(path, name))
    : joinName(path, names as string | undefined)) as T;

export const scopeDefaultValue = (
  path: string | undefined,
  names: Names,
  defaultValue: unknown,
) =>
  path && Array.isArray(names) && !isUndefined(defaultValue)
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

const scopedFormStates = new WeakMap<object, string>();

export const scopeFormState = <T extends Record<string, any>>(
  formState: T,
  path: string | undefined,
  control: Pick<Control, '_state' | '_formValues' | '_defaultValues'>,
): T => {
  if (isUndefined(path)) {
    return formState;
  }

  const result = {} as T;
  const empty = {};

  for (const key of Object.getOwnPropertyNames(formState)) {
    Object.defineProperty(result, key, {
      enumerable: Object.prototype.propertyIsEnumerable.call(formState, key),
      get: () =>
        key === 'errors' || key.endsWith('Fields')
          ? get(formState[key], path) || empty
          : key === 'isDirty'
            ? (formState.isDirty,
              formState.dirtyFields,
              !deepEqual(
                get(
                  control._state.mount
                    ? control._formValues
                    : control._defaultValues,
                  path,
                ),
                get(control._defaultValues, path),
              ))
            : key === 'isValidating'
              ? hasTrue(get(formState.validatingFields, path))
              : key === 'defaultValues' || key === 'values'
                ? get(formState[key], path)
                : key === 'name'
                  ? relativeName(path, formState.name)
                  : formState[key],
    });
  }

  scopedFormStates.set(result, path);

  return result;
};

const isName = (value: unknown): value is string | readonly string[] =>
  isString(value) || Array.isArray(value);

const createSelection = (
  methods: SelectMethods,
  path: string,
  select: (name?: string | number) => unknown,
) => {
  const control = methods.control;
  const resolve = (name: unknown) =>
    isName(name) ? scopeNames(path, name) : path;
  const withOptionalName =
    <T>(method: (name: string, options?: T) => unknown) =>
    (name?: unknown, options?: T) =>
      isString(name)
        ? method(joinName(path, name), options)
        : method(path, name as T);
  const register = withOptionalName<RegisterOptions>(methods.register);
  const setError = (name: unknown, error?: unknown, options?: unknown) =>
    isString(name)
      ? methods.setError(
          joinName(path, name),
          error as ErrorOption,
          options as never,
        )
      : methods.setError(path, name as ErrorOption, error as never);
  const getFieldState = (
    name?: unknown,
    formState?: FormState<FieldValues>,
  ) => {
    const fieldName = joinName(path, name as string | undefined);
    const formStatePath = formState && scopedFormStates.get(formState);
    const scopedName = isUndefined(formStatePath)
      ? fieldName
      : formStatePath && relativeName(formStatePath, fieldName);

    return scopedName
      ? methods.getFieldState(scopedName, formState)
      : methods.getFieldState(fieldName);
  };
  const unregister = (name?: unknown, options?: unknown) =>
    isName(name)
      ? methods.unregister(scopeNames(path, name), options as never)
      : methods.unregister(
          [...control._names.mount].filter(
            (fieldName) => !isUndefined(relativeName(path, fieldName)),
          ),
          name as never,
        );
  const scopedControl = Object.assign(Object.create(control), {
    register,
    unregister,
    getFieldState,
    setError,
  });

  scopes.set(scopedControl, { control, path });

  return {
    name: path,
    select: (name: string | number) => select(joinName(path, name)),
    control: scopedControl,
    get formState() {
      return scopeFormState(getFormState(control), path, control);
    },
    register,
    unregister,
    setError,
    getFieldState,
    getValues: (name?: unknown, config?: GetValuesConfig) =>
      (methods.getValues as Method)(resolve(name), config),
    getErrors: (name?: unknown) => (methods.getErrors as Method)(resolve(name)),
    clearErrors: (name?: unknown) => methods.clearErrors(resolve(name)),
    trigger: (name?: unknown, options?: TriggerConfig) =>
      methods.trigger(
        resolve(name),
        isName(name) ? options : (name as TriggerConfig),
      ),
    resetField: withOptionalName<object>(methods.resetField),
    setFocus: withOptionalName<SetFocusOptions>(methods.setFocus),
    setValue: (name: string, value: unknown, options?: SetValueConfig) =>
      methods.setValue(joinName(path, name), value, options),
    setValues: (
      values: FieldValues | ((values: FieldValues) => FieldValues),
      options?: SetValueConfig,
    ) =>
      methods.setValues((formValues: FieldValues) => {
        const current = get(formValues, path);
        const next = isFunction(values) ? values(current) : values;
        const key = path.split('.')[0];
        const updatedFormValues = cloneObject({ [key]: formValues[key] });

        set(
          updatedFormValues,
          path,
          isObject(current) ? { ...current, ...next } : next,
        );

        return updatedFormValues;
      }, options),
    watch: (name?: unknown, defaultValue?: unknown) =>
      isFunction(name)
        ? methods.watch((values, info) => {
            const relative = relativeName(path, info.name);

            (!isUndefined(relative) ||
              shouldSubscribeByName(path, info.name, true)) &&
              name(get(values, path), { ...info, name: relative });
          })
        : (methods.watch as Method)(
            resolve(name),
            scopeDefaultValue(path, name as Names, defaultValue),
          ),
    subscribe: (props: Parameters<UseFormReturn['subscribe']>[0]) =>
      methods.subscribe({
        ...props,
        name: scopeNames(path, props.name),
        callback: (data) =>
          props.callback(scopeFormState(data, path, control) as typeof data),
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
