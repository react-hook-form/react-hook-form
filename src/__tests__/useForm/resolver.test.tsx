import * as React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import { useForm } from '../../useForm';

describe('resolver', () => {
  it('should update context within the resolver', () => {
    type FormValues = {
      test: string;
    };

    const App = () => {
      const [test, setTest] = React.useState('');
      const [data, setData] = React.useState({});
      const { handleSubmit } = useForm<FormValues>({
        resolver: (_, context) => {
          return {
            errors: {},
            values: context as FormValues,
          };
        },
        context: {
          test,
        },
      });

      return (
        <>
          <input
            value={test}
            onChange={(e) => {
              setTest(e.target.value);
            }}
          />
          <button onClick={handleSubmit((data) => setData(data))}>Test</button>
          <p>{JSON.stringify(data)}</p>
        </>
      );
    };

    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test' },
    });
    fireEvent.click(screen.getByRole('button'));

    screen.findByText("{test:'test'}");
  });

  it('should support resolver schema switching', async () => {
    type FormValues = {
      test: string;
    };

    const fakeResolver = (schema: boolean) => async () => {
      return schema
        ? {
            values: { test: 'ok' },
            errors: {},
          }
        : {
            values: {},
            errors: {
              test: {
                type: 'test',
                value: { message: 'wrong', type: 'test' },
              },
            },
          };
    };

    const App = () => {
      const [schema, setSchema] = React.useState(false);
      const [submit, setSubmit] = React.useState(false);
      const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm<FormValues>({
        resolver: fakeResolver(schema),
      });

      return (
        <form
          onSubmit={handleSubmit(() => {
            setSubmit(true);
          })}
        >
          <input {...register('test')} />
          {errors.test && <p>Error</p>}
          {submit && <p>Submitted</p>}
          <button onClick={() => setSchema(!schema)}>Toggle</button>
          <button>Submit</button>
        </form>
      );
    };

    render(<App />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    });

    await waitFor(async () => {
      screen.getByText('Error');
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    });

    await waitFor(async () => {
      screen.getByText('Submitted');
    });
  });

  it('should be called with the shouldUseNativeValidation option to true', async () => {
    const resolver = jest.fn();
    const onSubmit = jest.fn();

    const App = () => {
      const { register, handleSubmit } = useForm({
        resolver,
        shouldUseNativeValidation: true,
      });

      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register('test')} />
          <button>Submit</button>
        </form>
      );
    };

    render(<App />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    });

    expect(resolver.mock.calls[0][2]).toEqual(
      expect.objectContaining({ shouldUseNativeValidation: true }),
    );
  });
});
