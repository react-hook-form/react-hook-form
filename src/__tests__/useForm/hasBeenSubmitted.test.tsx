import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

import { useForm } from '../../useForm';

describe('hasBeenSubmitted', () => {
  it('should initialize hasBeenSubmitted as false', () => {
    const { result } = renderHook(() => useForm());
    expect(result.current.formState.hasBeenSubmitted).toBe(false);
  });

  it('should set hasBeenSubmitted to true after first submission', async () => {
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
          <div data-testid="has-been-submitted">
            {String(formState.hasBeenSubmitted)}
          </div>
          <div data-testid="is-submitted">{String(formState.isSubmitted)}</div>
        </form>
      );
    };

    render(<Component />);

    // Initially false
    expect(screen.getByTestId('has-been-submitted')).toHaveTextContent('false');
    expect(screen.getByTestId('is-submitted')).toHaveTextContent('false');

    // Submit form
    fireEvent.submit(screen.getByRole('button'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(screen.getByTestId('has-been-submitted')).toHaveTextContent(
        'true',
      );
      expect(screen.getByTestId('is-submitted')).toHaveTextContent('true');
    });
  });

  it('should persist hasBeenSubmitted through form reset', async () => {
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
          <div data-testid="has-been-submitted">
            {String(formState.hasBeenSubmitted)}
          </div>
          <div data-testid="is-submitted">{String(formState.isSubmitted)}</div>
        </form>
      );
    };

    render(<Component />);

    // Submit form
    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(screen.getByTestId('has-been-submitted')).toHaveTextContent(
        'true',
      );
      expect(screen.getByTestId('is-submitted')).toHaveTextContent('true');
    });

    // Reset form
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    await waitFor(() => {
      // hasBeenSubmitted should persist
      expect(screen.getByTestId('has-been-submitted')).toHaveTextContent(
        'true',
      );
      // isSubmitted should reset
      expect(screen.getByTestId('is-submitted')).toHaveTextContent('false');
    });
  });

  it('should work with isDirtySinceSubmit after reset', async () => {
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
          <div data-testid="has-been-submitted">
            {String(formState.hasBeenSubmitted)}
          </div>
          <div data-testid="is-dirty-since-submit">
            {String(formState.isDirtySinceSubmit)}
          </div>
        </form>
      );
    };

    render(<Component />);
    const input = screen.getByRole('textbox');

    // Submit form
    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(screen.getByTestId('has-been-submitted')).toHaveTextContent(
        'true',
      );
      expect(screen.getByTestId('is-dirty-since-submit')).toHaveTextContent(
        'false',
      );
    });

    // Reset form
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    await waitFor(() => {
      expect(screen.getByTestId('has-been-submitted')).toHaveTextContent(
        'true',
      );
      expect(screen.getByTestId('is-dirty-since-submit')).toHaveTextContent(
        'false',
      );
    });

    // Change field after reset - should set isDirtySinceSubmit because hasBeenSubmitted is true
    fireEvent.change(input, { target: { value: 'changed' } });

    await waitFor(() => {
      expect(screen.getByTestId('has-been-submitted')).toHaveTextContent(
        'true',
      );
      expect(screen.getByTestId('is-dirty-since-submit')).toHaveTextContent(
        'true',
      );
    });
  });

  it('should remain true across multiple submissions', async () => {
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
          <div data-testid="has-been-submitted">
            {String(formState.hasBeenSubmitted)}
          </div>
          <div data-testid="submit-count">{formState.submitCount}</div>
        </form>
      );
    };

    render(<Component />);
    const button = screen.getByRole('button');

    // First submission
    fireEvent.submit(button);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('has-been-submitted')).toHaveTextContent(
        'true',
      );
      expect(screen.getByTestId('submit-count')).toHaveTextContent('1');
    });

    // Second submission
    fireEvent.submit(button);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('has-been-submitted')).toHaveTextContent(
        'true',
      );
      expect(screen.getByTestId('submit-count')).toHaveTextContent('2');
    });

    // Third submission
    fireEvent.submit(button);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(3);
      expect(screen.getByTestId('has-been-submitted')).toHaveTextContent(
        'true',
      );
      expect(screen.getByTestId('submit-count')).toHaveTextContent('3');
    });
  });
});
