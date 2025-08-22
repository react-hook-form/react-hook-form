import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react';

import { useForm } from '../../useForm';

describe('isDirtySinceSubmit', () => {
  it('should initialize isDirtySinceSubmit as false', () => {
    const { result } = renderHook(() => useForm());
    expect(result.current.formState.isDirtySinceSubmit).toBe(false);
  });

  it('should remain false when fields change before first submit', async () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          name: '',
        },
      }),
    );

    await act(async () => {
      result.current.setValue('name', 'test');
    });

    expect(result.current.formState.isDirtySinceSubmit).toBe(false);
  });

  it('should reset to false on form submission', async () => {
    const onSubmit = jest.fn();
    const Component = () => {
      const { register, handleSubmit, formState } = useForm({
        defaultValues: {
          name: '',
        },
      });

      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register('name')} />
          <button type="submit">Submit</button>
          <div data-testid="is-dirty-since-submit">
            {String(formState.isDirtySinceSubmit)}
          </div>
        </form>
      );
    };

    render(<Component />);

    fireEvent.submit(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByTestId('is-dirty-since-submit')).toHaveTextContent(
        'false',
      );
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('should set to true when field changes after submission', async () => {
    const onSubmit = jest.fn();
    const Component = () => {
      const { register, handleSubmit, formState } = useForm({
        defaultValues: {
          name: '',
        },
      });

      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register('name')} />
          <button type="submit">Submit</button>
          <div data-testid="is-dirty-since-submit">
            {String(formState.isDirtySinceSubmit)}
          </div>
        </form>
      );
    };

    render(<Component />);
    const input = screen.getByRole('textbox');

    // Submit form first
    fireEvent.submit(screen.getByRole('button'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    // Change field after submission
    fireEvent.change(input, { target: { value: 'updated' } });

    await waitFor(() => {
      expect(screen.getByTestId('is-dirty-since-submit')).toHaveTextContent(
        'true',
      );
    });
  });

  it('should reset to false on subsequent submission', async () => {
    const onSubmit = jest.fn();
    const Component = () => {
      const { register, handleSubmit, formState } = useForm({
        defaultValues: {
          name: '',
        },
      });

      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register('name')} />
          <button type="submit">Submit</button>
          <div data-testid="is-dirty-since-submit">
            {String(formState.isDirtySinceSubmit)}
          </div>
        </form>
      );
    };

    render(<Component />);
    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    // First submission
    fireEvent.submit(button);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    // Change field after first submission
    fireEvent.change(input, { target: { value: 'updated' } });
    await waitFor(() => {
      expect(screen.getByTestId('is-dirty-since-submit')).toHaveTextContent(
        'true',
      );
    });

    // Second submission
    fireEvent.submit(button);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('is-dirty-since-submit')).toHaveTextContent(
        'false',
      );
    });
  });

  it('should reset to false when form is reset', async () => {
    const onSubmit = jest.fn();
    const Component = () => {
      const { register, handleSubmit, formState, reset, setValue } = useForm({
        defaultValues: {
          name: '',
        },
      });

      React.useEffect(() => {
        if (formState.isSubmitted && !formState.isDirtySinceSubmit) {
          // After submit, change a field to trigger dirtySinceLastSubmit
          setValue('name', 'test');
        }
      }, [formState.isSubmitted, formState.isDirtySinceSubmit, setValue]);

      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register('name')} />
          <button type="submit">Submit</button>
          <button type="button" onClick={() => reset()}>
            Reset
          </button>
          <div data-testid="is-dirty-since-submit">
            {String(formState.isDirtySinceSubmit)}
          </div>
        </form>
      );
    };

    render(<Component />);

    // Submit form
    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    // Should have set value to 'test' after submit, making it dirty
    await waitFor(() => {
      expect(screen.getByTestId('is-dirty-since-submit')).toHaveTextContent(
        'true',
      );
    });

    // Reset form
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    await waitFor(() => {
      expect(screen.getByTestId('is-dirty-since-submit')).toHaveTextContent(
        'false',
      );
    });
  });

  it('should track multiple field changes after submission', async () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          name: '',
          email: '',
        },
      }),
    );

    // Submit form
    await act(async () => {
      await result.current.handleSubmit(() => {})();
    });

    expect(result.current.formState.isDirtySinceSubmit).toBe(false);

    // Change first field
    await act(async () => {
      result.current.setValue('name', 'test');
    });

    expect(result.current.formState.isDirtySinceSubmit).toBe(true);

    // Submit again
    await act(async () => {
      await result.current.handleSubmit(() => {})();
    });

    expect(result.current.formState.isDirtySinceSubmit).toBe(false);

    // Change second field
    await act(async () => {
      result.current.setValue('email', 'test@example.com');
    });

    expect(result.current.formState.isDirtySinceSubmit).toBe(true);
  });

  it('should work with validation errors', async () => {
    const onSubmit = jest.fn();
    const onError = jest.fn();

    const Component = () => {
      const { register, handleSubmit, formState } = useForm({
        defaultValues: {
          name: '',
        },
      });

      return (
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <input {...register('name', { required: true })} />
          <button type="submit">Submit</button>
          <div data-testid="is-dirty-since-submit">
            {String(formState.isDirtySinceSubmit)}
          </div>
        </form>
      );
    };

    render(<Component />);
    const input = screen.getByRole('textbox');

    // Submit with validation error
    fireEvent.submit(screen.getByRole('button'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
      expect(screen.getByTestId('is-dirty-since-submit')).toHaveTextContent(
        'false',
      );
    });

    // Fix validation error
    fireEvent.change(input, { target: { value: 'fixed' } });

    await waitFor(() => {
      expect(screen.getByTestId('is-dirty-since-submit')).toHaveTextContent(
        'true',
      );
    });
  });

  it('should set to true when field changes after submission and reset', async () => {
    const onSubmit = jest.fn();
    const Component = () => {
      const { register, handleSubmit, formState, reset } = useForm({
        defaultValues: {
          name: '',
        },
      });

      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register('name')} />
          <button type="submit">Submit</button>
          <button type="button" onClick={() => reset()}>
            Reset
          </button>
          <div data-testid="is-dirty-since-submit">
            {String(formState.isDirtySinceSubmit)}
          </div>
        </form>
      );
    };

    render(<Component />);
    const input = screen.getByRole('textbox');

    // Submit form first
    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(screen.getByTestId('is-dirty-since-submit')).toHaveTextContent(
        'false',
      );
    });

    // Reset form
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    await waitFor(() => {
      expect(screen.getByTestId('is-dirty-since-submit')).toHaveTextContent(
        'false',
      );
    });

    // Change field after reset
    fireEvent.change(input, { target: { value: 'updated after reset' } });

    await waitFor(() => {
      expect(screen.getByTestId('is-dirty-since-submit')).toHaveTextContent(
        'true',
      );
    });
  });
});
