import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { FieldErrors } from '../../types/errors';
import { useForm } from '../../useForm';
import noop from '../../utils/noop';
import sleep from '../../utils/sleep';

describe('resolver', () => {
  it('should update context within the resolver', async () => {
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

    expect(
      await screen.findByText('{"test":"test"}', undefined, { timeout: 3000 }),
    ).toBeVisible();
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

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Error')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Submitted')).toBeVisible();
  });

  it('should be called with the shouldUseNativeValidation option to true', async () => {
    const test = jest.fn();
    const resolver = (a: any, b: any, c: any) => {
      test(a, b, c);
      return {
        errors: {},
        values: {},
      };
    };

    const App = () => {
      const { register, handleSubmit } = useForm({
        resolver: async (data, context, options) =>
          resolver(data, context, options),
        shouldUseNativeValidation: true,
      });

      return (
        <form onSubmit={handleSubmit(noop)}>
          <input {...register('test')} />
          <button>Submit</button>
        </form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    expect(test.mock.calls[0][2]).toEqual(
      expect.objectContaining({ shouldUseNativeValidation: true }),
    );
  });

  it('should avoid the problem of race condition', async () => {
    jest.useFakeTimers();

    const test = jest.fn();
    let errorsObject = {};

    const resolver = async (a: any, b: any, c: any) => {
      test(a, b, c);

      if (a.test !== 'OK') {
        await sleep(100);
        return {
          errors: {
            test: {
              type: 'test',
              value: { message: 'wrong', type: 'test' },
            },
          },
          values: {},
        };
      }

      return {
        errors: {},
        values: { test: a.test },
      };
    };

    const App = () => {
      const {
        register,
        formState: { errors },
      } = useForm({
        resolver,
        mode: 'onChange',
      });
      errorsObject = errors;

      return (
        <form>
          <input type="text" {...register('test')} />
        </form>
      );
    };

    render(<App />);

    const inputElm = screen.getByRole('textbox');

    fireEvent.change(inputElm, {
      target: {
        value: 'O',
      },
    });

    fireEvent.change(inputElm, {
      target: {
        value: 'OK',
      },
    });

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(errorsObject).toEqual({});
  });

  it('should submit a transformed value on success', async () => {
    type FormValues = {
      alpha: string;
      beta: string;
    };

    const App = () => {
      const [data, setData] = React.useState(0);
      const { handleSubmit, setValue } = useForm<FormValues, any, number>({
        defaultValues: { alpha: '1', beta: '2' },
        resolver: ({ alpha, beta }) => {
          return {
            values: parseInt(alpha, 10) + parseInt(beta, 10),
            errors: {},
          };
        },
      });

      return (
        <>
          <button onClick={() => setValue('alpha', '9')}>Update</button>
          <button onClick={handleSubmit((data) => setData(data))}>Test</button>
          <p>result: {JSON.stringify(data)}</p>
        </>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByText('Update'));
    fireEvent.click(screen.getByText('Test'));

    expect(
      await screen.findByText('result: 11', undefined, { timeout: 3000 }),
    ).toBeVisible();
  });

  it('should submit field errors on failure', async () => {
    type FormValues = {
      alpha: string;
      beta: string;
    };

    const App = () => {
      const [errors, setErrors] = React.useState<
        FieldErrors<FormValues> | undefined
      >(undefined);
      const { handleSubmit, setValue } = useForm<FormValues, any, number>({
        defaultValues: { alpha: '1', beta: '2' },
        resolver: () => {
          return {
            values: {},
            errors: {
              alpha: {
                message: 'alpha is wrong',
                type: 'test',
              },
            },
          };
        },
      });

      return (
        <>
          <button onClick={() => setValue('alpha', '9')}>Update</button>
          <button onClick={handleSubmit(() => {}, setErrors)}>Test</button>
          <p>{errors?.alpha?.message}</p>
        </>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByText('Update'));
    fireEvent.click(screen.getByText('Test'));

    expect(
      await screen.findByText('alpha is wrong', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
  });
});
