import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { useForm } from '../../useForm';

describe('getFieldState', () => {
  describe('when input is primitive data type', () => {
    it('should display error state', async () => {
      const App = () => {
        const {
          trigger,
          register,
          _getFieldState,
          formState: { errors },
        } = useForm({
          defaultValues: {
            test: '',
          },
        });

        errors;

        return (
          <form>
            <input {...register('test', { required: 'This is required' })} />
            <button type={'button'} onClick={() => trigger()}>
              trigger
            </button>
            <p>{_getFieldState('test')?.error?.message}</p>
          </form>
        );
      };

      render(<App />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      screen.getByText('This is required');
    });

    it('should display isValid state', async () => {
      const App = () => {
        const {
          trigger,
          register,
          _getFieldState,
          formState: { errors },
        } = useForm({
          defaultValues: {
            test: '',
          },
        });

        errors;

        return (
          <form>
            <input {...register('test', { required: 'This is required' })} />
            <button type={'button'} onClick={() => trigger()}>
              trigger
            </button>
            <p>{_getFieldState('test')?.invalid ? 'error' : 'valid'}</p>
          </form>
        );
      };

      render(<App />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      screen.getByText('error');
    });
  });
});
