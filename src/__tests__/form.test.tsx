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

  it('should support render with both form tag and headless', () => {
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

  it('should handle success request callback', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const onSubmit = jest.fn();
    const onError = jest.fn();

    const App = () => {
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

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
      screen.getByText('submitSuccessful');
      screen.getByText('ok');
    });
  });

  it('should handle error request callback', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 500 }));

    const onSubmit = jest.fn();
    const onSuccess = jest.fn();

    const App = () => {
      const {
        control,
        formState: { isSubmitSuccessful, errors },
      } = useForm();

      return (
        <Form
          encType={'application/json'}
          action={'/error'}
          onSubmit={onSubmit}
          control={control}
        >
          <button>Submit</button>
          <p>{isSubmitSuccessful ? 'submitSuccessful' : 'submitFailed'}</p>
          {errors.root?.server && 'This is a server error'}
          <p>{errors.root?.server?.type}</p>
        </Form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
      screen.getByText('This is a server error');
      screen.getByText('500');
      screen.getByText('submitFailed');
    });
  });

  it('should validate custom status code', async () => {
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

  it('should support other request type', async () => {
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

  it('should support render props for react native', async () => {
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

  it('should support fetcher prop with external request', async () => {
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

  it('should include application/json header with encType supplied', async () => {
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

  it('should call a function action with FormData instead of fetching', async () => {
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

  it('should invoke onError when a function action throws', async () => {
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

  it('should not render method/encType on the form element when action is a function', () => {
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

  it('should still render method/encType on the form element when action is a URL string', () => {
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

  it('should support explicit "multipart/form-data" encType', async () => {
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
