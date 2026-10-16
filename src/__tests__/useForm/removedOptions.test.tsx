import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import { useForm } from '../../useForm';

describe('useForm options removed on re-render', () => {
  it('should stop using a resolver that is no longer passed', async () => {
    const resolver = jest.fn(async () => ({
      values: {},
      errors: { test: { type: 'custom', message: 'from resolver' } },
    }));
    const onSubmit = jest.fn();
    let setUseResolver: (value: boolean) => void = () => {};

    const App = () => {
      const [useResolver, setState] = React.useState(true);
      setUseResolver = setState;
      const { register, handleSubmit } = useForm<{ test: string }>(
        useResolver ? { resolver: resolver as never } : {},
      );

      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register('test')} />
          <button>submit</button>
        </form>
      );
    };

    render(<App />);

    act(() => setUseResolver(false));

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(resolver).not.toHaveBeenCalled();
  });

  it('should go back to the default mode when mode is no longer passed', async () => {
    const validate = jest.fn((value: string) => (value ? true : 'required'));
    let setUseMode: (value: boolean) => void = () => {};

    const App = () => {
      const [useMode, setState] = React.useState(true);
      setUseMode = setState;
      const { register } = useForm<{ test: string }>(
        useMode ? { mode: 'onChange' } : {},
      );

      return <input {...register('test', { validate })} />;
    };

    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });

    await waitFor(() => expect(validate).toHaveBeenCalledTimes(1));

    act(() => setUseMode(false));

    validate.mockClear();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    expect(validate).not.toHaveBeenCalled();
  });

  it('should clear errors when errors option is no longer passed', () => {
    let setErrors: (errors?: FieldErrors<{ test: string }>) => void = () => {};

    const App = () => {
      const [errors, setState] = React.useState<
        FieldErrors<{ test: string }> | undefined
      >({
        test: { type: 'server', message: 'server error' },
      });
      setErrors = setState;
      const {
        register,
        formState: { errors: formErrors },
      } = useForm<{ test: string }>({
        ...(errors ? { errors } : {}),
      });

      return (
        <div>
          <input {...register('test')} />
          {formErrors.test && <p role="alert">{formErrors.test.message}</p>}
        </div>
      );
    };

    render(<App />);

    expect(screen.getByRole('alert')).toHaveTextContent('server error');

    act(() => setErrors(undefined));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should maintain form invalidity when errors option is removed but client-side validation fails', async () => {
    let setErrors: (
      errors?: FieldErrors<{ test1: string; test2: string }>,
    ) => void = () => {};

    const App = () => {
      const [errors, setState] = React.useState<
        FieldErrors<{ test1: string; test2: string }> | undefined
      >({
        test1: { type: 'server', message: 'server error' },
      });
      setErrors = setState;
      const {
        register,
        formState: { errors: formErrors, isValid },
      } = useForm<{ test1: string; test2: string }>({
        mode: 'onChange',
        defaultValues: { test1: 'value', test2: '' },
        ...(errors ? { errors } : {}),
      });

      return (
        <div>
          <input {...register('test1')} />
          {formErrors.test1 && <p role="alert">{formErrors.test1.message}</p>}
          <input {...register('test2', { required: true })} />
          <p>{isValid ? 'valid' : 'invalid'}</p>
        </div>
      );
    };

    render(<App />);

    expect(screen.getByRole('alert')).toHaveTextContent('server error');
    expect(screen.getByText('invalid')).toBeVisible();

    act(() => setErrors(undefined));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('invalid')).toBeVisible();
  });
});
