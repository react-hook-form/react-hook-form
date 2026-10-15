import type {
  Control,
  FieldValues,
  FormState,
  GetValuesConfig,
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

type Template = string | { [key: string]: Template } | Template[];

type Entries = [string, string][];

export type Scope = {
  control: Control<any, any, any>;
  path: string;
  template?: Template;
  entries?: Entries;
  isItem?: boolean;
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

const joinName = (path: string, name?: string | number) =>
  isUndefined(name) || name === ''
    ? path
    : path
      ? `${path}.${name}`
      : String(name);

const stripName = (prefix: string, name?: string) =>
  !prefix
    ? name
    : name === prefix
      ? ''
      : name && name.startsWith(prefix + '.')
        ? name.slice(prefix.length + 1)
        : undefined;

const getEntries = (template: Template, key = ''): Entries =>
  isString(template)
    ? [[key, template]]
    : Object.entries(template).flatMap(([childKey, value]) =>
        getEntries(value, joinName(key, childKey)),
      );

const remap = (entries: Entries, name: string, isReverse?: boolean) => {
  for (const entry of entries) {
    const rest = stripName(entry[isReverse ? 1 : 0], name);

    if (!isUndefined(rest)) {
      return joinName(entry[isReverse ? 0 : 1], rest);
    }
  }

  return isReverse ? undefined : name;
};

const move = (value: any, entries: Entries, isReverse?: boolean) => {
  let result: any = {};

  for (const [key, target] of entries) {
    const [from, to] = isReverse ? [key, target] : [target, key];
    const item = from ? get(value, from) : value;

    isUndefined(item) || (to ? set(result, to, item) : (result = item));
  }

  return result;
};

export const mapItems = (
  scope: Scope | undefined,
  value: any,
  isReverse?: boolean,
) =>
  scope && scope.isItem
    ? Array.isArray(value)
      ? value.map((item) => move(item, scope.entries!, isReverse))
      : move(value, scope.entries!, isReverse)
    : value;

const resolveName = (
  { path, entries, isItem }: Scope,
  name?: string | number,
) => {
  if (isUndefined(name) || !entries) {
    return joinName(path, name);
  }

  const [index, rest] = splitName(String(name));

  return joinName(
    path,
    isItem
      ? joinName(index, remap(entries, rest))
      : remap(entries, String(name)),
  );
};

const relativeName = ({ path, entries, isItem }: Scope, name?: string) => {
  const relative = stripName(path, name);

  if (isUndefined(relative) || !entries) {
    return relative;
  }

  if (!isItem) {
    return remap(entries, relative, true);
  }

  const [index, rest] = splitName(relative);
  const itemName = rest && remap(entries, rest, true);

  return isUndefined(itemName) ? itemName : joinName(index, itemName);
};

const getScopeNames = ({ path, entries, isItem }: Scope) =>
  entries && !isItem
    ? entries.map(([, name]) => joinName(path, name))
    : path || undefined;

export const scopeNames = <T extends Names>(scope: Scope, names: T): T =>
  (isUndefined(names)
    ? getScopeNames(scope)
    : Array.isArray(names)
      ? names.map((name) => resolveName(scope, name))
      : resolveName(scope, names as string)) as T;

export const pick = (scope: Scope, value: unknown) => {
  const scopedValue = scope.path ? get(value, scope.path) : value;

  return scope.entries && !scope.isItem
    ? move(scopedValue, scope.entries)
    : mapItems(scope, scopedValue);
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
  (Array.isArray(names) || (!names && scope.entries && !scope.isItem))
    ? move(
        defaultValue,
        Array.isArray(names)
          ? names.map((name) => [name, resolveName(scope, name)])
          : scope.entries!.map(([key, name]) => [
              key,
              joinName(scope.path, name),
            ]),
        true,
      )
    : defaultValue;

const isValidating = (value: unknown) => !!value && !isEmptyObject(value);

export const scopeFormState = <T extends Record<string, any>>(
  formState: T,
  scope: Scope | undefined,
  control: Pick<Control, '_state' | '_formValues' | '_defaultValues'>,
): T => {
  if (!scope || (!scope.path && !scope.entries)) {
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

const rebaseTemplate = (template: Template, entries?: Entries): Template =>
  !entries
    ? template
    : Array.isArray(template)
      ? [rebaseTemplate(template[0], entries)]
      : Object.fromEntries(
          getEntries(template).map(([key, name]) => [
            key,
            remap(entries, name) as string,
          ]),
        );

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
      const isItem = Array.isArray(template);

      cache.set(
        key,
        createSelection({
          control,
          path,
          template,
          entries: template
            ? getEntries(isItem ? template[0] : template)
            : undefined,
          isItem,
        }),
      );
    }

    return cache.get(key);
  };

  const createSelection = (scope: Scope) => {
    const { path, template, entries, isItem } = scope;
    const resolve = (name: unknown) =>
      scopeNames(scope, isName(name) ? name : undefined);
    const withOptionalName =
      (method: Method) =>
      (name?: unknown, ...args: unknown[]) =>
        isString(name)
          ? method(resolveName(scope, name), ...args)
          : method(path, name, ...args);
    const register = withOptionalName(methods.register);
    const setError = withOptionalName(methods.setError);
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
      path || entries
        ? Object.assign(Object.create(control), {
            register,
            unregister,
            getFieldState,
            setError,
          })
        : control;
    const self = () => selection;

    scopedControl !== control && scopes.set(scopedControl, scope);

    const selectName = (name: string) => {
      const [index, rest] = splitName(name);
      const prefix = name + '.';
      const group =
        entries && !isItem
          ? entries.filter(([key]) => key.startsWith(prefix))
          : [];

      return isItem && !rest
        ? getSelection(joinName(path, index), (template as Template[])[0])
        : group.length
          ? getSelection(
              path,
              Object.fromEntries(
                group.map(([key, target]) => [
                  key.slice(prefix.length),
                  target,
                ]),
              ),
            )
          : getSelection(resolveName(scope, name));
    };

    const selection = {
      name: path,
      select: (name?: unknown) =>
        isUndefined(name)
          ? selection
          : isObject(name) || Array.isArray(name)
            ? getSelection(path, rebaseTemplate(name as Template, entries))
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
      resetField: withOptionalName(methods.resetField),
      setFocus: withOptionalName(methods.setFocus),
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

          if (!path && !entries) {
            return merged;
          }

          for (const [name, value] of entries && !isItem
            ? entries.map(([key, target]) => [
                joinName(path, target),
                key ? get(merged, key) : merged,
              ])
            : [[path, mapItems(scope, merged, true)]]) {
            const [key] = splitName(name);

            key in updatedFormValues ||
              (updatedFormValues[key] = cloneObject(formValues[key]));
            set(updatedFormValues, name, value);
          }

          return updatedFormValues;
        }, options),
      watch: (name?: unknown, defaultValue?: unknown) => {
        if (isFunction(name)) {
          const names = getScopeNames(scope);

          return methods.watch(
            (values, info) =>
              shouldSubscribeByName(names, info.name) &&
              name(pick(scope, values), {
                ...info,
                name: relativeName(scope, info.name),
              }),
          );
        }

        const value = (methods.watch as Method)(
          resolve(name),
          scopeDefaultValue(
            scope,
            isName(name) ? name : undefined,
            defaultValue,
          ),
        );

        return entries && !isName(name)
          ? pick(scope, methods.getValues())
          : value;
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

    return selection;
  };

  return (getSelection('') as { select: unknown }).select as UseFormSelect<
    TFieldValues,
    TContext,
    TTransformedValues
  >;
};
