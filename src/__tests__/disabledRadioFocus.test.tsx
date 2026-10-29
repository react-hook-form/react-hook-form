import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useForm } from '../useForm';

describe('radio focus with disabled first option', () => {
  it.each(['radio', 'checkbox'])(
    'focuses an enabled %s when the first group option is disabled',
    async (type) => {
      function App() {
        const { register, handleSubmit } = useForm<{ choice: string }>();
        return (
          <form onSubmit={handleSubmit(() => undefined)}>
            <input
              aria-label="Unavailable"
              type={type}
              value="a"
              disabled
              {...register('choice', { required: true })}
            />
            <input
              aria-label="Available"
              type={type}
              value="b"
              {...register('choice', { required: true })}
            />
            <button>Submit</button>
          </form>
        );
      }
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() =>
        expect(screen.getByLabelText('Available')).toHaveFocus(),
      );
    },
  );
  it('still focuses the first enabled option', async () => {
    function App() {
      const { register, handleSubmit } = useForm<{ choice: string }>();
      return (
        <form onSubmit={handleSubmit(() => undefined)}>
          <input
            aria-label="First"
            type="radio"
            value="a"
            {...register('choice', { required: true })}
          />
          <input
            aria-label="Second"
            type="radio"
            value="b"
            {...register('choice', { required: true })}
          />
          <button>Submit</button>
        </form>
      );
    }
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByLabelText('First')).toHaveFocus());
  });
  it('continues to the next invalid field when all group options are disabled', async () => {
    function App() {
      const { register, handleSubmit } = useForm<{
        choice: string;
        other: string;
      }>();
      return (
        <form onSubmit={handleSubmit(() => undefined)}>
          <input
            aria-label="Unavailable one"
            type="radio"
            value="a"
            disabled
            {...register('choice', { required: true })}
          />
          <input
            aria-label="Unavailable two"
            type="radio"
            value="b"
            disabled
            {...register('choice', { required: true })}
          />
          <input
            aria-label="Other"
            {...register('other', { required: true })}
          />
          <button>Submit</button>
        </form>
      );
    }
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByLabelText('Other')).toHaveFocus());
  });

  it('reenables every group option after disabling the form', async () => {
    function App() {
      const [disabled, setDisabled] = React.useState(false);
      const { register } = useForm<{ choice: string }>({ disabled });
      return (
        <>
          <input
            aria-label="First option"
            type="radio"
            value="a"
            {...register('choice')}
          />
          <input
            aria-label="Second option"
            type="radio"
            value="b"
            {...register('choice')}
          />
          <button onClick={() => setDisabled((value) => !value)}>Toggle</button>
        </>
      );
    }
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    await waitFor(() =>
      expect(screen.getByLabelText('First option')).toBeDisabled(),
    );
    expect(screen.getByLabelText('Second option')).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    await waitFor(() =>
      expect(screen.getByLabelText('First option')).toBeEnabled(),
    );
    expect(screen.getByLabelText('Second option')).toBeEnabled();
  });
});
