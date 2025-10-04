import 'whatwg-fetch';

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Form } from '../form';
import { useForm } from '../useForm';
import { FormProvider } from '../useFormContext';

describe('Form', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;

      switch (url) {
        case '/success':
          return new Response(JSON.stringify({ message: 'ok' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        case '/error':
          return new Response(null, { status: 500 });
        case '/status':
          return new Response(null, { status: 201 });
        case '/get':
          return new Response(null, { status: 200 });
        case '/json':
          if (
            init?.headers &&
            (init.headers as Record<string, string>)['content-type'] ===
              'application/json'
          ) {
            return new Response(null, { status: 200 });
          }
          return new Response(null, { status: 500 });
        case '/formData':
          if (init?.body instanceof FormData) {
            return new Response(null, { status: 200 });
          }
          return new Response(null, { status: 500 });
        default:
          return new Response(null, { status: 404 });
      }
    });
  });

  afterEach(() => {
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
          <Form control={methods.control} render={() => null} />
          <FormProvider {...methods}>
            <WithContext />
          </FormProvider>
        </div>
      );
    };

    render(<App />);
  });

  it('should handle success request callback', async () => {
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
          onSubmit={onSubmit}
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
});
