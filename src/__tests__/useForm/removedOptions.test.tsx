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
});
