import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import type { Control } from '../types';
import { useForm } from '../useForm';
import { useFormState } from '../useFormState';

describe('validationScope', () => {
  describe('field (default)', () => {
    it('should only populate errors for the field the user interacted with', async () => {
      function Component() {
        const {
          register,
          formState: { errors },
        } = useForm<{ firstName: string; lastName: string }>({
          mode: 'onChange',
        });

        return (
          <div>
            <input
              data-testid="firstName"
              {...register('firstName', { required: 'First name required' })}
            />
            <input
              data-testid="lastName"
              {...register('lastName', { required: 'Last name required' })}
            />
            {errors.firstName && <span>{errors.firstName.message}</span>}
            {errors.lastName && <span>{errors.lastName.message}</span>}
          </div>
        );
      }

      render(<Component />);

      fireEvent.input(screen.getByTestId('firstName'), {
        target: { value: 'John' },
      });

      await waitFor(() =>
        expect(
          screen.queryByText('First name required'),
        ).not.toBeInTheDocument(),
      );
      expect(screen.queryByText('Last name required')).not.toBeInTheDocument();
    });
  });

  describe('form', () => {
    it('should populate errors for every registered field with built-in validation rules', async () => {
      function Component() {
        const {
          register,
          formState: { errors },
        } = useForm<{ firstName: string; lastName: string }>({
          mode: 'onChange',
          validationScope: 'form',
        });

        return (
          <div>
            <input
              data-testid="firstName"
              {...register('firstName', { required: 'First name required' })}
            />
            <input
              data-testid="lastName"
              {...register('lastName', { required: 'Last name required' })}
            />
            {errors.firstName && <span>{errors.firstName.message}</span>}
            {errors.lastName && <span>{errors.lastName.message}</span>}
          </div>
        );
      }

      render(<Component />);

      fireEvent.input(screen.getByTestId('firstName'), {
        target: { value: 'John' },
      });

      await waitFor(() =>
        expect(screen.getByText('Last name required')).toBeVisible(),
      );
      expect(screen.queryByText('First name required')).not.toBeInTheDocument();
    });

    it('should populate errors for every field using a schema resolver', async () => {
      const resolver = jest.fn(async (data: any) => {
        const errors: Record<string, { message: string }> = {};

        if (!data.firstName) {
          errors.firstName = { message: 'First name required' };
        }
        if (!data.lastName) {
          errors.lastName = { message: 'Last name required' };
        }

        return { values: data, errors };
      });

      function Component() {
        const {
          register,
          formState: { errors, isValid },
        } = useForm<{ firstName: string; lastName: string }>({
          mode: 'onChange',
          validationScope: 'form',
          resolver,
        });

        return (
          <div>
            <input data-testid="firstName" {...register('firstName')} />
            <input data-testid="lastName" {...register('lastName')} />
            {errors.firstName && <span>{errors.firstName.message}</span>}
            {errors.lastName && <span>{errors.lastName.message}</span>}
            <span>{isValid ? 'valid' : 'invalid'}</span>
          </div>
        );
      }

      render(<Component />);

      fireEvent.input(screen.getByTestId('firstName'), {
        target: { value: 'John' },
      });

      await waitFor(() =>
        expect(screen.getByText('Last name required')).toBeVisible(),
      );
      expect(screen.queryByText('First name required')).not.toBeInTheDocument();
      expect(screen.getByText('invalid')).toBeVisible();

      fireEvent.input(screen.getByTestId('lastName'), {
        target: { value: 'Doe' },
      });

      await waitFor(() => expect(screen.getByText('valid')).toBeVisible());
    });

    it('should populate errors for other fields when the changed field has no rules', async () => {
      function Component() {
        const {
          register,
          formState: { errors },
        } = useForm<{ firstName: string; lastName: string }>({
          mode: 'onChange',
          validationScope: 'form',
        });

        return (
          <div>
            <input data-testid="firstName" {...register('firstName')} />
            <input
              data-testid="lastName"
              {...register('lastName', { required: 'Last name required' })}
            />
            {errors.lastName && <span>{errors.lastName.message}</span>}
          </div>
        );
      }

      render(<Component />);

      fireEvent.input(screen.getByTestId('firstName'), {
        target: { value: 'John' },
      });

      await waitFor(() =>
        expect(screen.getByText('Last name required')).toBeVisible(),
      );
    });

    it('should notify named error subscribers for other fields', async () => {
      type FormValues = { firstName: string; lastName: string };

      function LastNameError({ control }: { control: Control<FormValues> }) {
        const { errors } = useFormState({ control, name: 'lastName' });

        return errors.lastName ? <span>{errors.lastName.message}</span> : null;
      }

      const MemoLastNameError = React.memo(LastNameError);

      function Component() {
        const { register, control } = useForm<FormValues>({
          mode: 'onChange',
          validationScope: 'form',
        });

        return (
          <div>
            <input
              data-testid="firstName"
              {...register('firstName', { required: 'First name required' })}
            />
            <input
              data-testid="lastName"
              {...register('lastName', { required: 'Last name required' })}
            />
            <MemoLastNameError control={control} />
          </div>
        );
      }

      render(<Component />);

      fireEvent.input(screen.getByTestId('firstName'), {
        target: { value: 'John' },
      });

      await waitFor(() =>
        expect(screen.getByText('Last name required')).toBeVisible(),
      );
    });

    it('should keep errors from the latest change when an earlier schema validation resolves last', async () => {
      const pending: (() => void)[] = [];
      const resolver = jest.fn(
        (data: any) =>
          new Promise<any>((resolve) => {
            const errors: Record<string, { type: string; message: string }> =
              {};

            if (!data.lastName) {
              errors.lastName = {
                type: 'required',
                message: 'Last name required',
              };
            }

            pending.push(() => resolve({ values: data, errors }));
          }),
      );

      function Component() {
        const {
          register,
          formState: { errors },
        } = useForm<{ firstName: string; lastName: string }>({
          mode: 'onChange',
          validationScope: 'form',
          resolver,
        });

        return (
          <div>
            <input data-testid="firstName" {...register('firstName')} />
            <input data-testid="lastName" {...register('lastName')} />
            {errors.lastName && <span>{errors.lastName.message}</span>}
          </div>
        );
      }

      render(<Component />);

      fireEvent.input(screen.getByTestId('firstName'), {
        target: { value: 'John' },
      });
      fireEvent.input(screen.getByTestId('lastName'), {
        target: { value: 'Doe' },
      });

      await waitFor(() => expect(pending).toHaveLength(2));

      await act(async () => {
        pending[1]();
      });
      await act(async () => {
        pending[0]();
      });

      expect(screen.queryByText('Last name required')).not.toBeInTheDocument();
    });

    it('should keep errors from the latest change when an earlier built-in validation resolves last', async () => {
      const pending: (() => void)[] = [];

      function Component() {
        const {
          register,
          formState: { errors },
        } = useForm<{ firstName: string; lastName: string }>({
          mode: 'onChange',
          validationScope: 'form',
        });

        return (
          <div>
            <input
              data-testid="lastName"
              {...register('lastName', {
                validate: (value) =>
                  new Promise<string | true>((resolve) =>
                    pending.push(() =>
                      resolve(value ? true : 'Last name required'),
                    ),
                  ),
              })}
            />
            <input data-testid="firstName" {...register('firstName')} />
            {errors.lastName && <span>{errors.lastName.message}</span>}
          </div>
        );
      }

      render(<Component />);

      fireEvent.input(screen.getByTestId('firstName'), {
        target: { value: 'John' },
      });
      fireEvent.input(screen.getByTestId('lastName'), {
        target: { value: 'Doe' },
      });

      await waitFor(() => expect(pending).toHaveLength(2));

      await act(async () => {
        pending[1]();
      });
      await act(async () => {
        pending[0]();
      });

      expect(screen.queryByText('Last name required')).not.toBeInTheDocument();
    });
  });
});
