import React from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';

import { useForm } from '../../useForm';

describe('unregister', () => {
  it('should unregister an registered item', async () => {
    const { result } = renderHook(() => useForm<{ input: string }>());

    result.current.register('input');

    await act(async () => {
      await result.current.unregister('input');
    });

    expect(result.current.getValues()).toEqual({});
  });

  it('should unregister an registered item with array name', async () => {
    const { result } = renderHook(() =>
      useForm<{
        input: string;
        input2: string;
      }>(),
    );

    result.current.register('input');
    result.current.register('input');
    result.current.register('input2');

    await act(async () => {
      await result.current.unregister(['input', 'input2']);
    });

    expect(result.current.getValues()).toEqual({});
  });

  it('should unregister all inputs', async () => {
    const { result } = renderHook(() =>
      useForm<{
        input: string;
        input2: string;
      }>(),
    );

    result.current.register('input');
    result.current.register('input');
    result.current.register('input2');

    await act(async () => {
      await result.current.unregister();
    });

    expect(result.current.getValues()).toEqual({});
  });

  it('should recompute isDirty after a field is unregistered and re-registered back to its default value (#13397)', async () => {
    let isDirty: boolean | null = null;

    const App = () => {
      const { register, watch, formState } = useForm({
        defaultValues: { showName: true, name: 'default' },
        shouldUnregister: true,
      });
      isDirty = formState.isDirty;
      const showName = watch('showName');

      return (
        <form>
          <input type="checkbox" {...register('showName')} />
          {showName && <input type="text" {...register('name')} />}
        </form>
      );
    };

    render(<App />);

    const checkbox = screen.getByRole('checkbox');

    fireEvent.click(checkbox);
    await waitFor(() => expect(isDirty).toBe(true));

    fireEvent.click(checkbox);
    await waitFor(() => expect(isDirty).toBe(false));
  });

  it('should recompute isDirty when a dirty field is unregistered', async () => {
    let isDirty: boolean | null = null;
    let dirtyFields: Record<string, unknown> = {};

    const App = () => {
      const [show, setShow] = React.useState(true);
      const { register, unregister, formState } = useForm({
        defaultValues: { firstName: 'bill', lastName: 'luo' },
      });

      isDirty = formState.isDirty;
      dirtyFields = formState.dirtyFields;

      return (
        <form>
          {show && <input {...register('firstName')} placeholder="firstName" />}
          <input {...register('lastName')} placeholder="lastName" />
          <button
            type="button"
            onClick={() => {
              unregister('firstName');
              setShow(false);
            }}
          >
            unregister
          </button>
        </form>
      );
    };

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText('firstName'), {
      target: { value: 'changed' },
    });

    await waitFor(() => expect(isDirty).toBe(true));

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(dirtyFields).toEqual({}));
    expect(isDirty).toBe(false);
  });

  it('should preserve isDirty when a dirty field is unregistered with keepDirty', async () => {
    let isDirty: boolean | null = null;
    let dirtyFields: Record<string, unknown> = {};

    const App = () => {
      const [show, setShow] = React.useState(true);
      const { register, unregister, formState } = useForm({
        defaultValues: { firstName: 'bill', lastName: 'luo' },
      });

      isDirty = formState.isDirty;
      dirtyFields = formState.dirtyFields;

      return (
        <form>
          {show && <input {...register('firstName')} placeholder="firstName" />}
          <input {...register('lastName')} placeholder="lastName" />
          <button
            type="button"
            onClick={() => {
              unregister('firstName', { keepDirty: true });
              setShow(false);
            }}
          >
            unregister
          </button>
        </form>
      );
    };

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText('firstName'), {
      target: { value: 'changed' },
    });

    await waitFor(() => expect(isDirty).toBe(true));

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(dirtyFields).toEqual({ firstName: true }));
    expect(isDirty).toBe(true);
  });

  it('should not flip isDirty to true when a field with no defaultValue is registered from useEffect', async () => {
    let isDirty: boolean | null = null;

    const App = () => {
      const {
        register,
        formState: { isDirty: isDirtyState },
      } = useForm<{ firstName: string; lastName: string }>();

      isDirty = isDirtyState;

      React.useEffect(() => {
        register('firstName');
        register('lastName');
      }, [register]);

      return <form />;
    };

    render(<App />);

    await waitFor(() => expect(isDirty).toBe(false));
  });

  it('should cancel a pending delayError timer when the field is unregistered', async () => {
    jest.useFakeTimers();

    const message = 'too long.';

    const App = () => {
      const [show, setShow] = React.useState(true);
      const {
        register,
        formState: { errors },
      } = useForm<{ test: string }>({
        delayError: 500,
        mode: 'onChange',
        shouldUnregister: true,
      });

      return (
        <div>
          {show && <input {...register('test', { maxLength: 4 })} />}
          <button type="button" onClick={() => setShow(false)}>
            hide
          </button>
          {errors.test && <p>{message}</p>}
        </div>
      );
    };

    render(<App />);

    // Schedule a delayed error, then unmount the field before the delay elapses.
    await act(async () => {
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: '123456' },
      });
    });

    fireEvent.click(screen.getByRole('button', { name: 'hide' }));

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // The field is gone, so this error would be impossible for a user to clear.
    expect(screen.queryByText(message)).not.toBeInTheDocument();

    jest.useRealTimers();
  });
});
