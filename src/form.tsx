import React from 'react';

import { jsonToFormData } from './utils/formData';
import isString from './utils/isString';
import { safeJSONStringify } from './utils/json';
import type { FieldValues, FormProps } from './types';
import { useFormContext } from './useFormContext';

const POST_REQUEST = 'post';

/**
 * Form component to manage submission.
 *
 * @param props - to setup submission detail. {@link FormProps}
 *
 * @returns form component or headless render prop.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { control, formState: { errors } } = useForm();
 *
 *   return (
 *     <Form action="/api" control={control}>
 *       <input {...register("name")} />
 *       <p>{errors?.root?.server && 'Server error'}</p>
 *       <button>Submit</button>
 *     </Form>
 *   );
 * }
 * ```
 */
function Form<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
>(props: FormProps<TFieldValues, TTransformedValues>) {
  const methods = useFormContext<TFieldValues, any, TTransformedValues>();
  const [mounted, setMounted] = React.useState(false);
  const {
    control = methods.control,
    onSubmit,
    children,
    action,
    method = POST_REQUEST,
    headers,
    encType,
    onError,
    render,
    onSuccess,
    validateStatus = (status) => status >= 200 && status < 300,
    ...rest
  } = props;

  const handleSubmit = React.useMemo(
    () =>
      control.handleSubmit(async (data, event) => {
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
            const shouldStringifySubmissionData =
              (headers && headers['Content-Type'].includes('json')) ||
              (encType && encType.includes('json'));

            const response = await fetch(action, {
              method,
              headers: {
                ...headers,
                ...(encType &&
                  encType !== 'multipart/form-data' && {
                    'Content-Type': encType,
                  }),
              },
              body: shouldStringifySubmissionData ? formDataJson : formData,
            });

            if (response && !validateStatus(response.status)) {
              onError && onError({ response });
              return { type: String(response.status) };
            } else {
              onSuccess && onSuccess({ response });
            }
          } catch (error: unknown) {
            onError && onError({ error });
            return { type: '' };
          }
        }

        return;
      }),
    [
      control,
      onSubmit,
      validateStatus,
      action,
      headers,
      encType,
      onError,
      onSuccess,
      method,
    ],
  );

  const submit = React.useCallback(
    async (event?: React.BaseSyntheticEvent) => {
      const err = await handleSubmit(event);

      if (err && control) {
        control._subjects.state.next({ isSubmitSuccessful: false });
        control.setError('root.server', { type: err.type });
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

  return (
    <form
      noValidate={mounted}
      action={action}
      method={method}
      encType={encType}
      onSubmit={submit}
      {...rest}
    >
      {children}
    </form>
  );
}

export { Form };
