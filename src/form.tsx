import React from 'react';

import { jsonToFormData } from './utils/formData';
import isFunction from './utils/isFunction';
import isString from './utils/isString';
import { safeJSONStringify } from './utils/json';
import noop from './utils/noop';
import type { FieldValues, FormProps } from './types';
import { useFormControlContext } from './useFormControlContext';

const POST_REQUEST = 'post';

function defaultValidateStatus(status: number) {
  return status >= 200 && status < 300;
}

/**
 * Form component that handles submission, including optional `action` fetch and server error wiring.
 *
 * @see [API](https://react-hook-form.com/docs/useform/form)
 *
 * @example
 * ```tsx
 * <Form action="/api" control={control}>
 *   <input {...register("name")} />
 *   <p>{errors?.root?.server && 'Server error'}</p>
 *   <button>Submit</button>
 * </Form>
 * ```
 */
export function Form<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
>(props: FormProps<TFieldValues, TTransformedValues>): React.ReactNode {
  const formControl = useFormControlContext<
    TFieldValues,
    unknown,
    TTransformedValues
  >();
  const [mounted, setMounted] = React.useState(false);
  const {
    control = formControl,
    onSubmit = noop,
    children,
    action,
    method = POST_REQUEST,
    headers,
    encType,
    onError = noop,
    render,
    onSuccess = noop,
    validateStatus = defaultValidateStatus,
    ...rest
  } = props;

  const handleSubmit = React.useMemo(() => {
    return control.handleSubmit(async (data, event) => {
      const formData = jsonToFormData(data);
      const formDataJson = safeJSONStringify(data);

      if (onSubmit) {
        await onSubmit({
          data,
          event,
          method,
          formData,
          formDataJson,
        });
      }

      if (isString(action)) {
        try {
          const hasContentType = (type: RegExp) =>
            (headers &&
              Object.entries(headers).some(
                ([name, value]) =>
                  name.toLowerCase() === 'content-type' && type.test(value),
              )) ||
            (encType && type.test(encType));

          let body: BodyInit = formData;

          if (hasContentType(/json/i)) {
            body = formDataJson;
          } else if (
            hasContentType(/^\s*application\/x-www-form-urlencoded\s*(;|$)/i)
          ) {
            body = new URLSearchParams(
              Array.from(formData, ([name, value]) => [
                name,
                isString(value) ? value : value.name,
              ]),
            );
          } else if (hasContentType(/^\s*text\/plain\s*(;|$)/i)) {
            body = Array.from(
              formData,
              ([name, value]) =>
                `${name}=${isString(value) ? value : value.name}\r\n`,
            ).join('');
          }

          const requestHeaders = { ...headers };

          for (const name in requestHeaders) {
            if (
              name.toLowerCase() === 'content-type' &&
              /^\s*multipart\/form-data\s*(;|$)/i.test(requestHeaders[name])
            ) {
              delete requestHeaders[name];
            }
          }

          const response = await fetch(action, {
            method,
            headers: {
              ...requestHeaders,
              ...(encType &&
                encType !== 'multipart/form-data' && {
                  'Content-Type': encType,
                }),
            },
            body,
          });

          if (response && !validateStatus(response.status)) {
            onError({ response });
            return { type: String(response.status) };
          } else {
            onSuccess({ response });
          }
        } catch (error: unknown) {
          onError({ error });
          return { type: '' };
        }
      }

      if (isFunction(action)) {
        try {
          await action(formData);
        } catch (error: unknown) {
          onError({ error });
          return { type: '' };
        }
      }

      // Return nothing when successful.
      return;
    });
  }, [
    control,
    onSubmit,
    method,
    action,
    headers,
    encType,
    validateStatus,
    onError,
    onSuccess,
  ]);

  const submit = React.useCallback(
    async (event?: React.BaseSyntheticEvent) => {
      const err = await handleSubmit(event);

      if (err && control) {
        control._subjects.state.next({ isSubmitSuccessful: false });
        control.setError('root.server', err);
      }
    },
    [handleSubmit, control],
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (render) {
    return render({ submit });
  }

  // React forbids passing `method`/`encType` alongside a function `action`
  // (a Server-Action-style submission) -- it manages those itself and warns
  // if they're present, so they're only rendered for string/URL actions.
  return (
    <form
      noValidate={mounted}
      action={action}
      {...(!isFunction(action) && { method, encType })}
      onSubmit={submit}
      {...rest}
    >
      {children}
    </form>
  );
}
