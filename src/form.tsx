import React from 'react';

import { jsonToFormData } from './utils/formData';
import isString from './utils/isString';
import { safeJSONStringify } from './utils/json';
import type { FieldValues, FormProps } from './types';
import { useFormContext } from './useFormContext';

const POST_REQUEST = 'post';

function defaultValidateStatus(status: number) {
  return status >= 200 && status < 300;
}

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
    onSubmit: onSubmitProp,
    children,
    action,
    method = POST_REQUEST,
    headers,
    encType,
    onError,
    render,
    onSuccess,
    validateStatus: validateStatusProp,
    ...rest
  } = props;

  const handleSubmit = React.useMemo(
    () =>
      control.handleSubmit(async (data, event) => {
        let hasError = false;
        let type = '';
        const formData = jsonToFormData(data as any);
        const formDataJson = safeJSONStringify(data) || '';

        if (onSubmitProp) {
          await onSubmitProp({
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

            const validateStatus = validateStatusProp ?? defaultValidateStatus;

            if (response && !validateStatus(response.status)) {
              hasError = true;
              onError && onError({ response });
              type = String(response.status);
            } else {
              onSuccess && onSuccess({ response });
            }
          } catch (error: unknown) {
            hasError = true;
            onError && onError({ error });
          }
        }

        return { type, hasError };
      }),
    [
      action,
      encType,
      onError,
      onSuccess,
      validateStatusProp,
      headers,
      control,
      method,
      onSubmitProp,
    ],
  );

  const submit = React.useCallback(
    async (event?: React.BaseSyntheticEvent) => {
      const result = await handleSubmit(event);

      if (result && result.hasError && control) {
        control._subjects.state.next({ isSubmitSuccessful: false });
        control.setError('root.server', { type: result && result.type });
      }
    },
    [handleSubmit, control],
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return render ? (
    <>
      {render({
        submit,
      })}
    </>
  ) : (
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
