import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import { Controller } from '../../controller';
import { createFormControl } from '../../logic/createFormControl';
import type { UseFormProps } from '../../types';
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

  it('should stop emitting progressive enhancement attributes when progressive is no longer passed', () => {
    let setUseProgressive: (value: boolean) => void = () => {};

    const App = () => {
      const [useProgressive, setState] = React.useState(true);
      setUseProgressive = setState;
      const { register } = useForm<{ test: string }>(
        useProgressive ? { progressive: true } : {},
      );

      return (
        <input
          {...register('test', {
            required: true,
          })}
        />
      );
    };

    render(<App />);

    expect(screen.getByRole('textbox')).toBeRequired();

    act(() => setUseProgressive(false));

    expect(screen.getByRole('textbox')).not.toBeRequired();
  });

  it('should re-enable the form when disabled is no longer passed', async () => {
    const onSubmit = jest.fn();
    let setUseDisabled: (value: boolean) => void = () => {};

    const App = () => {
      const [useDisabled, setState] = React.useState(true);
      setUseDisabled = setState;
      const { register, control, handleSubmit, formState } = useForm<{
        native: string;
        controlled: string;
      }>({
        defaultValues: { native: 'a', controlled: 'b' },
        ...(useDisabled ? { disabled: true } : {}),
      });

      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input aria-label="native" {...register('native')} />
          <Controller
            control={control}
            name="controlled"
            render={({ field }) => <input aria-label="controlled" {...field} />}
          />
          <p>{formState.disabled ? 'disabled' : 'enabled'}</p>
          <button>submit</button>
        </form>
      );
    };

    render(<App />);

    expect(screen.getByRole('textbox', { name: 'native' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'controlled' })).toBeDisabled();

    act(() => setUseDisabled(false));

    expect(screen.getByRole('textbox', { name: 'native' })).toBeEnabled();
    expect(screen.getByRole('textbox', { name: 'controlled' })).toBeEnabled();
    expect(screen.getByText('enabled')).toBeVisible();

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { native: 'a', controlled: 'b' },
        expect.anything(),
      ),
    );
  });

  it('should keep a field disabled by its own option when disabled is no longer passed', () => {
    let setUseDisabled: (value: boolean) => void = () => {};

    const App = () => {
      const [useDisabled, setState] = React.useState(true);
      setUseDisabled = setState;
      const { register } = useForm<{ locked: string; open: string }>(
        useDisabled ? { disabled: true } : {},
      );

      return (
        <>
          <input
            aria-label="locked"
            {...register('locked', { disabled: true })}
          />
          <input aria-label="open" {...register('open')} />
        </>
      );
    };

    render(<App />);

    act(() => setUseDisabled(false));

    expect(screen.getByRole('textbox', { name: 'locked' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'open' })).toBeEnabled();
  });

  it('should not re-enable a formControl created with disabled on re-render', () => {
    const { formControl } = createFormControl<{ test: string }>({
      disabled: true,
    });

    const App = () => {
      const { register } = useForm({ formControl });

      return <input aria-label="test" {...register('test')} />;
    };

    const { rerender } = render(<App />);

    rerender(<App />);

    expect(screen.getByRole('textbox', { name: 'test' })).toBeDisabled();
  });

  describe('when switching formControl', () => {
    type Props = Pick<UseFormProps<{ test: string }>, 'formControl'> & {
      disabled?: boolean;
    };

    const App = ({ formControl, disabled }: Props) => {
      const { register } = useForm({
        formControl,
        ...(disabled ? { disabled } : {}),
      });

      return <input aria-label="test" {...register('test')} />;
    };

    it('should not re-enable a disabled formControl when disabled is no longer passed', () => {
      const first = createFormControl<{ test: string }>().formControl;
      const second = createFormControl<{ test: string }>({
        disabled: true,
      }).formControl;

      const { rerender } = render(<App formControl={first} disabled />);

      rerender(<App formControl={second} />);

      expect(screen.getByRole('textbox', { name: 'test' })).toBeDisabled();
    });

    it('should re-enable the new formControl when disabled is removed after the switch', () => {
      const first = createFormControl<{ test: string }>().formControl;
      const second = createFormControl<{ test: string }>().formControl;

      const { rerender } = render(<App formControl={first} disabled />);

      rerender(<App formControl={second} disabled />);

      expect(screen.getByRole('textbox', { name: 'test' })).toBeDisabled();

      rerender(<App formControl={second} />);

      expect(screen.getByRole('textbox', { name: 'test' })).toBeEnabled();
    });
  });
});
