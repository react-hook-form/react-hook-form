import 'whatwg-fetch';

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Form } from '../form';
import { useForm } from '../useForm';
import { FormProvider } from '../useFormContext';

describe('Form', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('support render with both form tag and headless', () => {
    const WithContext = () => (
      <>
        <Form />
        <Form render={() => null} />
      </>
    );

    const App = () => {
      const methods = useForm();
      return (
        <div>
          <Form control={methods.control}>
            <input />
          </Form>
          <Form
            control={methods.control}
            render={() => {
              return null;
            }}
          />

          <FormProvider {...methods}>
            <WithContext />
          </FormProvider>
        </div>
      );
    };

    render(<App />);
  });

  it('handle success request callback', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const onSubmit = jest.fn();
    const onError = jest.fn();

    type AppProps = {
      onSubmit: () => void;
      onError: () => void;
    };

    const App = ({ onError, onSubmit }: AppProps) => {
      const [message, setMessage] = React.useState('');
      const {
        control,
        formState: { isSubmitSuccessful },
      } = useForm();

      return (
        <Form
          encType={'application/json'}
          action={'/success'}
          onSubmit={({ data, formData, formDataJson }) => {
            data;
            formData;
            formDataJson;
            onSubmit();
          }}
          control={control}
          onError={onError}
          onSuccess={async ({ response }) => {
            if (response) {
              const data: { message: string } = await response.json();
              setMessage(data.message);
            }
          }}
        >
          <button>Submit</button>
          <p>{isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}</p>
          <p>{message}</p>
        </Form>
      );
    };

    render(<App onError={onError} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
      screen.getByText('submitSuccessful');
      screen.getByText('ok');
    });
  });

  it('handle error request callback', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 500 }));

    const onSubmit = jest.fn();
    const onSuccess = jest.fn();

    type AppProps = {
      onSubmit: () => void;
      onSuccess: () => void;
    };

    const App = ({ onSubmit, onSuccess }: AppProps) => {
      const {
        control,
        formState: { isSubmitSuccessful, errors },
      } = useForm();

      return (
        <Form
          encType={'application/json'}
          action={'/error'}
          onSubmit={onSubmit}
          onSuccess={onSuccess}
          control={control}
        >
          <button>Submit</button>
          <p>{isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}</p>
          {errors.root?.server && 'This is a server error'}
          <p>{errors.root?.server?.type}</p>
        </Form>
      );
    };

    render(<App onSuccess={onSuccess} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
      screen.getByText('This is a server error');
      screen.getByText('500');
      screen.getByText('submitFailed');
    });
  });

  it('validate custom status code', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 201 }));

    const App = () => {
      const {
        control,
        formState: { isSubmitSuccessful },
      } = useForm();

      return (
        <Form
          encType={'application/json'}
          action={'/status'}
          control={control}
          validateStatus={(status) => status === 200}
        >
          <button>Submit</button>
          <p>{isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}</p>
        </Form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      screen.getByText('submitFailed');
    });
  });

  it('support other request type', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const App = () => {
      const {
        control,
        formState: { isSubmitSuccessful },
      } = useForm();

      return (
        <Form encType={'application/json'} action={'/get'} control={control}>
          <button>Submit</button>
          <p>{isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}</p>
        </Form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      screen.getByText('submitSuccessful');
    });
  });

  it('support render props for react native', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const App = () => {
      const {
        control,
        formState: { isSubmitSuccessful },
      } = useForm();

      return (
        <Form
          control={control}
          render={({ submit }) => {
            return (
              <>
                <button onClick={() => submit()}>Submit</button>
                <p>
                  {isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}
                </p>
              </>
            );
          }}
        />
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      screen.getByText('submitSuccessful');
    });
  });

  it('support fetcher prop with external request', async () => {
    const fetcher = jest.fn().mockResolvedValue({});
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const App = () => {
      const {
        control,
        formState: { isSubmitSuccessful },
      } = useForm();

      return (
        <Form
          control={control}
          onSubmit={async () => {
            await fetcher();
          }}
        >
          <button>Submit</button>
          <p>{isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}</p>
        </Form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      screen.getByText('submitSuccessful');

      expect(fetcher).toHaveBeenCalled();
    });
  });

  it('include application/json header with encType supplied', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const onSuccess = jest.fn();

    const App = () => {
      const {
        control,
        formState: { isSubmitSuccessful },
      } = useForm();

      return (
        <Form
          encType={'application/json'}
          action={'/json'}
          control={control}
          onSuccess={onSuccess}
        >
          <button>Submit</button>
          <p>{isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}</p>
        </Form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it.each([
    ['Content-Type', 'application/json', true],
    ['Content-Type', 'application/JSON', true],
    ['content-type', 'application/json', true],
    ['CoNtEnT-TyPe', 'application/json', true],
    ['content-type', 'text/plain', false],
    ['content-type', 'application/x-www-form-urlencodedfoo', false],
    ['X-Response-Format', 'application/json', false],
  ] as const)(
    'choose the submission body for header %s: %s',
    async (headerName, headerValue, isJSON) => {
      const fetchSpy = jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(new Response(null, { status: 200 }));
      const headers = { [headerName]: headerValue };

      const App = () => {
        const { register, control } = useForm({
          defaultValues: { name: 'bill' },
        });

        return (
          <Form action="/json" control={control} headers={headers}>
            <input {...register('name')} />
            <button>Submit</button>
          </Form>
        );
      };

      render(<App />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(
          '/json',
          expect.objectContaining({
            headers,
            body: isJSON
              ? JSON.stringify({ name: 'bill' })
              : expect.any(FormData),
          }),
        );
      });
    },
  );

  it.each([
    [
      'encType',
      'application/x-www-form-urlencoded',
      { encType: 'application/x-www-form-urlencoded' },
    ],
    [
      'headers',
      'application/x-www-form-urlencoded',
      { headers: { 'content-type': 'application/x-www-form-urlencoded' } },
    ],
    [
      'headers',
      'application/x-www-form-urlencoded; charset=UTF-8',
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      },
    ],
  ] as const)(
    'send a url-encoded body when %s sets %s',
    async (_, contentType, props) => {
      const fetchSpy = jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(new Response(null, { status: 200 }));
      const resume = new Blob(['content'], { type: 'text/plain' });

      const App = () => {
        const { register, control } = useForm({
          defaultValues: { name: 'bill', city: 'New York', resume },
        });

        return (
          <Form action="/api" control={control} {...props}>
            <input {...register('name')} />
            <input {...register('city')} />
            <button>Submit</button>
          </Form>
        );
      };

      render(<App />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => expect(fetchSpy).toHaveBeenCalled());

      const init = fetchSpy.mock.calls[0][1];

      expect(new Headers(init?.headers).get('content-type')).toBe(contentType);
      expect(String(init?.body)).toBe('name=bill&city=New+York&resume=blob');
    },
  );

  it('call a function action with FormData instead of fetching', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    const actionFn = jest.fn<(formData: FormData) => Promise<void>>(
      async () => {},
    );

    const App = () => {
      const { register, control } = useForm({
        defaultValues: { name: 'bill' },
      });

      return (
        <Form control={control} action={actionFn}>
          <input {...register('name')} />
          <button>Submit</button>
        </Form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(actionFn).toHaveBeenCalledTimes(1);
    });

    const formData = actionFn.mock.calls[0][0];
    expect(formData.get('name')).toBe('bill');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('include file values in the submitted FormData', async () => {
    const actionFn = jest.fn<(formData: FormData) => Promise<void>>(
      async () => {},
    );
    const resume = new Blob(['content'], { type: 'text/plain' });

    const App = () => {
      const { register, control } = useForm({
        defaultValues: { name: 'bill', resume },
      });

      return (
        <Form control={control} action={actionFn}>
          <input {...register('name')} />
          <button>Submit</button>
        </Form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(actionFn).toHaveBeenCalledTimes(1);
    });

    const formData = actionFn.mock.calls[0][0];
    expect(formData.get('name')).toBe('bill');
    expect(formData.get('resume')).toBeInstanceOf(Blob);
  });

  it('invoke onError when a function action throws', async () => {
    const onError = jest.fn();
    const actionFn = jest.fn(async () => {
      throw new Error('boom');
    });

    const App = () => {
      const { control } = useForm();

      return (
        <Form control={control} action={actionFn} onError={onError}>
          <button>Submit</button>
        </Form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
    });
    expect((onError.mock.calls[0][0] as { error: Error }).error.message).toBe(
      'boom',
    );
  });

  it('not render method/encType on the form element when action is a function', () => {
    const App = () => {
      const { control } = useForm();

      return (
        <Form control={control} action={async () => {}} encType="text/plain">
          <button>Submit</button>
        </Form>
      );
    };

    const { container } = render(<App />);
    const form = container.querySelector('form') as HTMLFormElement;

    expect(form.hasAttribute('method')).toBe(false);
    expect(form.hasAttribute('enctype')).toBe(false);
  });

  it('still render method/encType on the form element when action is a URL string', () => {
    const App = () => {
      const { control } = useForm();

      return (
        <Form control={control} action="/api" encType="text/plain">
          <button>Submit</button>
        </Form>
      );
    };

    const { container } = render(<App />);
    const form = container.querySelector('form') as HTMLFormElement;

    expect(form.getAttribute('method')).toBe('post');
    expect(form.getAttribute('enctype')).toBe('text/plain');
  });

  it('support explicit "multipart/form-data" encType', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const onSuccess = jest.fn();

    const App = () => {
      const {
        control,
        formState: { isSubmitSuccessful },
      } = useForm();

      return (
        <Form
          encType={'multipart/form-data'}
          action={'/formData'}
          control={control}
          onSuccess={onSuccess}
        >
          <button>Submit</button>
          <p>{isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}</p>
        </Form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
