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
import isEmptyObject from '../utils/isEmptyObject';
import isFunction from '../utils/isFunction';
import isObject from '../utils/isObject';
import isString from '../utils/isString';
import isUndefined from '../utils/isUndefined';
import set from '../utils/set';

import getFormStateSnapshot from './getFormStateSnapshot';
import getProxyFormState from './getProxyFormState';
import shouldSubscribeByName from './shouldSubscribeByName';

export type Template = string | { [key: string]: Template } | Template[];

export type Scope = {
  control: Control<any, any, any>;
  path: string;
  template?: Template;
};

type Names = string | readonly string[] | undefined;

type SelectMethods = Omit<UseFormReturn<any, any, any>, 'formState' | 'select'>;

type Method = (...args: any[]) => any;

const FIELD_STATE_KEYS = [
  'errors',
  'dirtyFields',
  'touchedFields',
  'validatingFields',
];

const scopes = new WeakMap<object, Scope>();

const scopedFormStates = new WeakMap<object, FormState<FieldValues>>();

const isName = (value: unknown): value is string | readonly string[] =>
  isString(value) || Array.isArray(value);

const splitName = (name: string): [string, string] => {
  const index = name.indexOf('.');

  return index < 0 ? [name, ''] : [name.slice(0, index), name.slice(index + 1)];
};

export const joinName = (path: string, name?: string | number) =>
  isUndefined(name) || name === ''
    ? path
    : path
      ? `${path}.${name}`
      : String(name);

const mapName = (template: Template | undefined, name: string): string => {
  if (isString(template)) {
    return joinName(template, name);
  }

  const [key, rest] = splitName(name);

  if (Array.isArray(template)) {
    return joinName(key, mapName(template[0], rest));
  }

  const target = template && (template as Record<string, Template>)[key];

  return isUndefined(target) ? name : mapName(target, rest);
};

const getTemplateEntries = (
  template: Template,
  key = '',
): [string, string][] =>
  isString(template) || Array.isArray(template)
    ? [[key, isString(template) ? template : '']]
    : Object.entries(template).flatMap(([childKey, value]) =>
        getTemplateEntries(value, joinName(key, childKey)),
      );

export const pickTemplate = (value: any, template?: Template): any => {
  if (!template) {
    return value;
  }

  if (isString(template)) {
    return template ? get(value, template) : value;
  }

  if (Array.isArray(template)) {
    return Array.isArray(value)
      ? value.map((item) => pickTemplate(item, template[0]))
      : value;
  }

  const result: Record<string, unknown> = {};

  for (const key in template) {
    const picked = pickTemplate(value, template[key]);

    isUndefined(picked) ||
      (isObject(template[key]) && isEmptyObject(picked)) ||
      (result[key] = picked);
  }

  return result;
};

export const unpickTemplate = (
  value: any,
  template?: Template,
  isItem?: boolean,
): any => {
  if (!template) {
    return value;
  }

  if (Array.isArray(template)) {
    return Array.isArray(value)
      ? value.map((item) => unpickTemplate(item, template[0]))
      : isItem
        ? unpickTemplate(value, template[0])
        : value;
  }

  let result: any = {};

  for (const [key, name] of getTemplateEntries(template)) {
    const item = key ? get(value, key) : value;

    isUndefined(item) || (name ? set(result, name, item) : (result = item));
  }

  return result;
};

const stripName = (prefix: string, name?: string) =>
  !prefix
    ? name
    : name === prefix
      ? ''
      : name && name.startsWith(prefix + '.')
        ? name.slice(prefix.length + 1)
        : undefined;

const unmapName = (template: Template, name: string): string | undefined => {
  if (Array.isArray(template)) {
    const [index, rest] = splitName(name);
    const itemName = rest ? unmapName(template[0], rest) : '';

    return isUndefined(itemName) ? itemName : joinName(index, itemName);
  }

  for (const [key, target] of getTemplateEntries(template)) {
    const relative = stripName(target, name);

    if (!isUndefined(relative)) {
      return joinName(key, relative);
    }
  }

  return undefined;
};

const relativeName = ({ path, template }: Scope, name?: string) => {
  const relative = stripName(path, name);

  return isUndefined(relative) || !template
    ? relative
    : unmapName(template, relative);
};

const resolveName = ({ path, template }: Scope, name?: string | number) =>
  joinName(
    path,
    isUndefined(name) || !template ? name : mapName(template, String(name)),
  );

const getScopePaths = ({ path, template }: Scope) =>
  template && !Array.isArray(template)
    ? getTemplateEntries(template).map(([, name]) => joinName(path, name))
    : path || undefined;

export const scopeNames = <T extends Names>(scope: Scope, names: T): T =>
  (isUndefined(names)
    ? getScopePaths(scope)
    : Array.isArray(names)
      ? names.map((name) => resolveName(scope, name))
      : resolveName(scope, names as string)) as T;

export const pick = ({ path, template }: Scope, value: unknown) =>
  pickTemplate(path ? get(value, path) : value, template);

export const pickOutput = (
  scope: Scope,
  names: Names,
  output: unknown,
): any => {
  if (!scope.template || !isUndefined(names)) {
    return output;
  }

  const scopeNames = getScopePaths(scope);

  if (!Array.isArray(scopeNames)) {
    return pickTemplate(output, scope.template);
  }

  const values = {};

  scopeNames.forEach((name, index) =>
    set(values, name, (output as unknown[])[index]),
  );

  return pick(scope, values);
};

export const resolveScope = <TControl, TName extends Names>(
  control: TControl,
  name: TName,
): [TControl, TName, Scope?] => {
  const scope = control && scopes.get(control);

  return scope
    ? [scope.control as TControl, scopeNames(scope, name), scope]
    : [control, name];
};

export const scopeDefaultValue = (
  scope: Scope | undefined,
  names: Names,
  defaultValue: unknown,
) =>
  scope &&
  !isUndefined(defaultValue) &&
  (Array.isArray(names) || (isUndefined(names) && isObject(scope.template)))
    ? unpickTemplate(
        defaultValue,
        Array.isArray(names)
          ? Object.fromEntries(
              names.map((name) => [name, resolveName(scope, name)]),
            )
          : rebaseTemplate(scope.template as Template, scope.path),
      )
    : defaultValue;

const rebaseTemplate = (
  template: Template,
  parent: Template | undefined,
): Template =>
  isString(template)
    ? mapName(parent, template)
    : Array.isArray(template)
      ? [
          rebaseTemplate(
            template[0],
            Array.isArray(parent) ? parent[0] : parent,
          ),
        ]
      : Object.fromEntries(
          Object.entries(template).map(([key, value]) => [
            key,
            rebaseTemplate(value, parent),
          ]),
        );

export const scopeFormState = <T extends Record<string, any>>(
  formState: T,
  scope: Scope | undefined,
  control: Pick<Control, '_state' | '_formValues' | '_defaultValues'>,
): T => {
  if (!scope || (!scope.path && !scope.template)) {
    return formState;
  }

  const result = {} as T;
  const empty = {};

  for (const key of Object.getOwnPropertyNames(formState)) {
    Object.defineProperty(result, key, {
      enumerable: formState.propertyIsEnumerable(key),
      get: () =>
        FIELD_STATE_KEYS.includes(key)
          ? pick(scope, formState[key]) || empty
          : key === 'isDirty'
            ? (formState.isDirty,
              formState.dirtyFields,
              !deepEqual(
                pick(
                  scope,
                  control._state.mount
                    ? control._formValues
                    : control._defaultValues,
                ),
                pick(scope, control._defaultValues),
              ))
            : key === 'isValidating'
              ? isValidating(pick(scope, formState.validatingFields))
              : key === 'defaultValues' || key === 'values'
                ? pick(scope, formState[key])
                : key === 'name'
                  ? relativeName(scope, formState.name)
                  : formState[key],
    });
  }

  scopedFormStates.set(result, formState as unknown as FormState<FieldValues>);

  return result;
};

const isValidating = (value: unknown) => !!value && !isEmptyObject(value);

const getFormState = (control: Control<any, any, any>) =>
  getProxyFormState(getFormStateSnapshot(control), control);

export default <TFieldValues extends FieldValues, TContext, TTransformedValues>(
  formMethods: Omit<
    UseFormReturn<TFieldValues, TContext, TTransformedValues>,
    'formState' | 'select'
  >,
): UseFormSelect<TFieldValues, TContext, TTransformedValues> => {
  const methods = formMethods as unknown as SelectMethods;
  const control = methods.control;
  const cache = new Map<string, unknown>();

  const getSelection = (path: string, template?: Template) => {
    const key = template ? path + JSON.stringify(template) : path;

    if (!cache.has(key)) {
      cache.set(key, createSelection({ control, path, template }));
    }

    return cache.get(key);
  };

  const createSelection = (scope: Scope) => {
    const { path, template } = scope;
    const resolve = (name: unknown) =>
      scopeNames(scope, isName(name) ? name : undefined);
    const withOptionalName =
      <T>(method: (name: string, options?: T) => unknown) =>
      (name?: unknown, options?: T) =>
        isString(name)
          ? method(resolveName(scope, name), options)
          : method(path, name as T);
    const register = withOptionalName<RegisterOptions>(methods.register);
    const setError = (name: unknown, error?: unknown, options?: unknown) =>
      isString(name)
        ? methods.setError(
            resolveName(scope, name),
            error as ErrorOption,
            options as never,
          )
        : methods.setError(path, name as ErrorOption, error as never);
    const getFieldState = (
      name?: unknown,
      formState?: FormState<FieldValues>,
    ) =>
      methods.getFieldState(
        resolveName(scope, name as string | undefined),
        (formState && scopedFormStates.get(formState)) || formState,
      );
    const unregister = (name?: unknown, options?: unknown) =>
      isName(name)
        ? methods.unregister(scopeNames(scope, name), options as never)
        : methods.unregister(
            [...control._names.mount].filter(
              (fieldName) => !isUndefined(relativeName(scope, fieldName)),
            ),
            name as never,
          );
    const scopedControl =
      path || template
        ? Object.assign(Object.create(control), {
            register,
            unregister,
            getFieldState,
            setError,
          })
        : control;
    const self = () => selection;

    scopedControl !== control && scopes.set(scopedControl, scope);

    const selection = {
      name: path,
      select: (name?: unknown) =>
        isUndefined(name)
          ? selection
          : isObject(name) || Array.isArray(name)
            ? getSelection(path, rebaseTemplate(name as Template, template))
            : selectName(String(name)),
      control: scopedControl,
      get formState() {
        return scopeFormState(getFormState(control), scope, control);
      },
      register,
      unregister,
      setError,
      getFieldState,
      getValues: (name?: unknown, config?: GetValuesConfig) =>
        isName(name)
          ? (methods.getValues as Method)(resolve(name), config)
          : pick(scope, methods.getValues(undefined, config)),
      getErrors: (name?: unknown) =>
        isName(name)
          ? (methods.getErrors as Method)(resolve(name))
          : pick(scope, methods.getErrors()),
      clearErrors: (name?: unknown) => methods.clearErrors(resolve(name)),
      trigger: (name?: unknown, options?: TriggerConfig) =>
        methods.trigger(
          resolve(name),
          isName(name) ? options : (name as TriggerConfig),
        ),
      resetField: withOptionalName<object>(methods.resetField),
      setFocus: withOptionalName<SetFocusOptions>(methods.setFocus),
      setValue: (name: string, value: unknown, options?: SetValueConfig) =>
        methods.setValue(resolveName(scope, name), value, options),
      setValues: (
        values: FieldValues | ((values: FieldValues) => FieldValues),
        options?: SetValueConfig,
      ) =>
        methods.setValues((formValues: FieldValues) => {
          const current = pick(scope, formValues);
          const next = isFunction(values) ? values(current) : values;
          const merged = isObject(current) ? { ...current, ...next } : next;
          const updatedFormValues: FieldValues = {};

          if (!path && !template) {
            return merged;
          }

          for (const [key, name] of isObject(template)
            ? getTemplateEntries(template)
            : [['', '']]) {
            const fieldName = joinName(path, name);
            const [rootKey] = splitName(fieldName);

            rootKey in updatedFormValues ||
              (updatedFormValues[rootKey] = cloneObject(formValues[rootKey]));
            set(
              updatedFormValues,
              fieldName,
              key ? get(merged, key) : unpickTemplate(merged, template),
            );
          }

          return updatedFormValues;
        }, options),
      watch: (name?: unknown, defaultValue?: unknown) => {
        if (isFunction(name)) {
          const names = getScopePaths(scope);

          return methods.watch(
            (values, info) =>
              shouldSubscribeByName(names, info.name) &&
              name(pick(scope, values), {
                ...info,
                name: relativeName(scope, info.name),
              }),
          );
        }

        const names = resolve(name);

        return pickOutput(
          scope,
          isName(name) ? name : undefined,
          (methods.watch as Method)(
            names,
            scopeDefaultValue(
              scope,
              isName(name) ? name : undefined,
              defaultValue,
            ),
          ),
        );
      },
      subscribe: (props: Parameters<UseFormReturn['subscribe']>[0]) =>
        methods.subscribe({
          ...props,
          name: scopeNames(scope, props.name),
          callback: (data) =>
            props.callback(scopeFormState(data, scope, control) as typeof data),
        }),
      map: <T, R>(
        fields: T[],
        callback: (
          field: T,
          selection: unknown,
          index: number,
          fields: T[],
          origin: unknown,
        ) => R,
      ) =>
        fields.map((field, index) =>
          callback(field, selectName(String(index)), index, fields, selection),
        ),
      narrow: self,
      assert: self,
      defined: self,
      cast: self,
    };

    const selectName = (name: string) => {
      const [key, rest] = splitName(name);
      const target = Array.isArray(template)
        ? template[0]
        : isObject<Record<string, Template>>(template)
          ? template[key]
          : undefined;

      return target && !isString(target) && !rest
        ? getSelection(
            Array.isArray(template) ? joinName(path, key) : path,
            target,
          )
        : getSelection(resolveName(scope, name));
    };

    return selection;
  };

  return (getSelection('') as { select: unknown }).select as UseFormSelect<
    TFieldValues,
    TContext,
    TTransformedValues
  >;
};
