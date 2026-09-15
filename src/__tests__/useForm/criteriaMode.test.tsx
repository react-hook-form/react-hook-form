import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useForm } from '../../useForm';

describe('criteriaMode', () => {
  it('should report every error after switching criteriaMode to all at runtime', async () => {
    let types: string[] = [];
    let message: unknown = undefined;

    const App = ({ criteriaMode }: { criteriaMode: 'firstError' | 'all' }) => {
      const { register, formState, trigger } = useForm<{ test: string }>({
        mode: 'onSubmit',
        criteriaMode,
      });
      const error = formState.errors.test as unknown as
        | { types?: Record<string, unknown>; message?: unknown }
        | undefined;
      types = error && error.types ? Object.keys(error.types) : [];
      message = error?.message;

      return (
        <form>
          <input
            {...register('test', {
              minLength: { value: 5, message: 'short' },
              pattern: { value: /^[0-9]+$/, message: 'num' },
            })}
          />
          <button type="button" onClick={() => trigger('test')}>
            validate
          </button>
        </form>
      );
    };

    const { rerender } = render(<App criteriaMode="firstError" />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
    fireEvent.click(screen.getByText('validate'));

    await waitFor(() => {
      expect(message).toBe('short');
    });
    // firstError mode collects no `types` map
    expect(types).toEqual([]);

    rerender(<App criteriaMode="all" />);
    fireEvent.click(screen.getByText('validate'));

    await waitFor(() => {
      expect(types).toEqual(expect.arrayContaining(['minLength', 'pattern']));
    });
  });

  it('should narrow back to the first error after switching criteriaMode to firstError at runtime', async () => {
    let types: string[] = [];
    let message: unknown = undefined;

    const App = ({ criteriaMode }: { criteriaMode: 'firstError' | 'all' }) => {
      const { register, formState, trigger } = useForm<{ test: string }>({
        mode: 'onSubmit',
        criteriaMode,
      });
      const error = formState.errors.test as unknown as
        | { types?: Record<string, unknown>; message?: unknown }
        | undefined;
      types = error && error.types ? Object.keys(error.types) : [];
      message = error?.message;

      return (
        <form>
          <input
            {...register('test', {
              minLength: { value: 5, message: 'short' },
              pattern: { value: /^[0-9]+$/, message: 'num' },
            })}
          />
          <button type="button" onClick={() => trigger('test')}>
            validate
          </button>
        </form>
      );
    };

    const { rerender } = render(<App criteriaMode="all" />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ab' } });
    fireEvent.click(screen.getByText('validate'));

    await waitFor(() => {
      expect(types).toEqual(expect.arrayContaining(['minLength', 'pattern']));
    });

    rerender(<App criteriaMode="firstError" />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abc' } });
    fireEvent.click(screen.getByText('validate'));

    await waitFor(() => {
      expect(types).toEqual([]);
      expect(message).toBe('short');
    });
  });
});
