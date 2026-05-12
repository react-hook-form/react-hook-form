import React from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';

import { Controller } from '../../controller';
import { useController } from '../../useController';
import { useForm } from '../../useForm';

describe('setValues', () => {
  it('should batch update multiple values', async () => {
    const { result } = renderHook(() =>
      useForm<{ a: string; b: string }>({
        defaultValues: { a: '1', b: '2' },
      }),
    );

    await act(async () => {
      result.current.setValues({
        a: '10',
        b: '20',
      });
    });

    expect(result.current.getValues()).toEqual({
      a: '10',
      b: '20',
    });
  });

  it('should support function updater', async () => {
    const { result } = renderHook(() =>
      useForm<{ a: string; b: string }>({
        defaultValues: { a: '1', b: '2' },
      }),
    );

    await act(async () => {
      result.current.setValues((values) => ({
        a: values.a + 'x',
        b: values.b + 'y',
      }));
    });

    expect(result.current.getValues()).toEqual({
      a: '1x',
      b: '2y',
    });
  });

  it('should not notify subscribers when batch values are unchanged', async () => {
    const { result } = renderHook(() =>
      useForm<{ a: string; b: string }>({
        defaultValues: { a: '1', b: '2' },
      }),
    );

    const control = result.current.control as any;
    const nextSpy = jest.spyOn(control._subjects.state, 'next');

    await act(async () => {
      result.current.setValues({
        a: '1',
        b: '2',
      });
    });

    const valueNotifications = nextSpy.mock.calls.filter(
      (call) =>
        call[0] != null &&
        typeof call[0] === 'object' &&
        'values' in (call[0] as Record<string, unknown>),
    );

    expect(valueNotifications).toHaveLength(0);
  });

  it('should notify subscribers only once for batch update', async () => {
    const { result } = renderHook(() =>
      useForm<{ a: string; b: string }>({
        defaultValues: { a: '1', b: '2' },
      }),
    );

    const control = result.current.control as any;
    const nextSpy = jest.spyOn(control._subjects.state, 'next');

    await act(async () => {
      result.current.setValues({
        a: '100',
        b: '200',
      });
    });

    const valueNotifications = nextSpy.mock.calls.filter(
      (call) =>
        call[0] != null &&
        typeof call[0] === 'object' &&
        'values' in (call[0] as Record<string, unknown>),
    );

    expect(valueNotifications).toHaveLength(1);
  });

  it('should update controlled input value when setValues is called', async () => {
    const Component = () => {
      const { control, setValues } = useForm({
        defaultValues: {
          firstName: '',
        },
      });

      return (
        <>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => <input {...field} />}
          />
          <button
            type="button"
            onClick={() =>
              setValues({
                firstName: '111',
              })
            }
          >
            set
          </button>
        </>
      );
    };

    render(<Component />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'set' }));
    });

    expect(screen.getByRole('textbox')).toHaveValue('111');
  });

  it('should update registered input value when setValues is called', async () => {
    const Component = () => {
      const { register, setValues } = useForm({
        defaultValues: {
          firstName: '',
        },
      });

      return (
        <>
          <input {...register('firstName')} />
          <button
            type="button"
            onClick={() =>
              setValues({
                firstName: '111',
              })
            }
          >
            set
          </button>
        </>
      );
    };

    render(<Component />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'set' }));
    });

    expect(screen.getByRole('textbox')).toHaveValue('111');
  });

  it('should update deep nested registered input values when setValues is called', async () => {
    const Component = () => {
      const { register, setValues } = useForm({
        defaultValues: {
          user: {
            profile: { firstName: 'Jane', lastName: 'Doe' },
            address: { city: 'Boston' },
          },
        },
      });

      return (
        <>
          <input
            {...register('user.profile.firstName')}
            aria-label="firstName"
          />
          <input {...register('user.profile.lastName')} aria-label="lastName" />
          <input {...register('user.address.city')} aria-label="city" />
          <button
            type="button"
            onClick={() =>
              setValues({
                user: {
                  profile: { firstName: 'John', lastName: 'Smith' },
                  address: { city: 'New York' },
                },
              })
            }
          >
            set
          </button>
        </>
      );
    };

    render(<Component />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'set' }));
    });

    expect(screen.getByLabelText('firstName')).toHaveValue('John');
    expect(screen.getByLabelText('lastName')).toHaveValue('Smith');
    expect(screen.getByLabelText('city')).toHaveValue('New York');
  });

  it('should trigger re-render in useController components when using setValues', async () => {
    function TestField({ control, name }: { control: any; name: string }) {
      const { field } = useController({ name, control });

      return (
        <input
          data-testid={name}
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.value)}
        />
      );
    }

    function App() {
      const methods = useForm<{ field1: string; field2: string }>({
        defaultValues: {
          field1: 'initial1',
          field2: 'initial2',
        },
        mode: 'onChange',
      });

      return (
        <div>
          <form>
            <TestField control={methods.control} name="field1" />
            <TestField control={methods.control} name="field2" />
            <button
              data-testid="submit"
              disabled={!methods.formState.isValid}
              type="button"
            >
              Submit
            </button>
          </form>
          <button
            data-testid="set-values"
            type="button"
            onClick={() => {
              methods.setValues(
                { field1: 'updated1', field2: 'updated2' },
                { shouldValidate: true, shouldDirty: true },
              );
            }}
          >
            Set Values
          </button>
          <div data-testid="form-state">
            isValid: {String(methods.formState.isValid)}
          </div>
        </div>
      );
    }

    render(<App />);

    const field1 = screen.getByTestId('field1');
    const field2 = screen.getByTestId('field2');
    const setValuesBtn = screen.getByTestId('set-values');
    const submitBtn = screen.getByTestId('submit');
    const formState = screen.getByTestId('form-state');

    // Initial state
    expect(field1).toHaveValue('initial1');
    expect(field2).toHaveValue('initial2');

    // Clear fields to make form invalid
    fireEvent.change(field1, { target: { value: '' } });
    fireEvent.change(field2, { target: { value: '' } });

    await waitFor(() => {
      expect(field1).toHaveValue('');
      expect(field2).toHaveValue('');
      expect(submitBtn).toBeDisabled();
    });

    // Click setValues button
    fireEvent.click(setValuesBtn);

    // Form state should be updated (this works)
    await waitFor(() => {
      expect(formState.textContent).toContain('isValid: true');
    });

    // BUG: DOM inputs are NOT updated even though form state is correct
    // This demonstrates the bug where useController components don't re-render
    await waitFor(() => {
      expect(field1).toHaveValue('updated1');
      expect(field2).toHaveValue('updated2');
      expect(submitBtn).toBeEnabled();
    });
  });
});
