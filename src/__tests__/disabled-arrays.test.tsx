import React, { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Controller } from '../controller';
import { useForm } from '../useForm';

describe('Disabled arrays - Edge cases and Integration', () => {
  describe('Edge cases', () => {
    it('should handle nested field paths in disabled array', async () => {
      function App() {
        const { register } = useForm({
          disabled: ['user.name', 'user.address.city'],
          defaultValues: {
            user: {
              name: '',
              email: '',
              address: {
                city: '',
                country: '',
              },
            },
          },
        });

        return (
          <form>
            <input {...register('user.name')} placeholder="name" />
            <input {...register('user.email')} placeholder="email" />
            <input {...register('user.address.city')} placeholder="city" />
            <input
              {...register('user.address.country')}
              placeholder="country"
            />
          </form>
        );
      }

      render(<App />);

      await waitFor(() => {
        expect(
          (screen.getByPlaceholderText('name') as HTMLInputElement).disabled,
        ).toBeTruthy();
        expect(
          (screen.getByPlaceholderText('email') as HTMLInputElement).disabled,
        ).toBeFalsy();
        expect(
          (screen.getByPlaceholderText('city') as HTMLInputElement).disabled,
        ).toBeTruthy();
        expect(
          (screen.getByPlaceholderText('country') as HTMLInputElement).disabled,
        ).toBeFalsy();
      });
    });

    it('should handle large disabled arrays efficiently', async () => {
      const startTime = performance.now();

      function App() {
        // Create a large array of field names to disable
        const disabledFields = Array.from(
          { length: 100 },
          (_, i) => `field${i}`,
        );
        const { register } = useForm({
          disabled: disabledFields,
        });

        return (
          <form>
            {Array.from({ length: 100 }, (_, i) => (
              <input
                key={i}
                {...register(`field${i}` as any)}
                placeholder={`field${i}`}
                data-testid={`field${i}`}
              />
            ))}
          </form>
        );
      }

      render(<App />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);

      // Verify all fields are disabled
      await waitFor(() => {
        for (let i = 0; i < 100; i++) {
          expect(screen.getByTestId(`field${i}`)).toBeDisabled();
        }
      });
    });

    it('should maintain disabled state during form reset', async () => {
      function App() {
        const { register, reset } = useForm({
          disabled: ['firstName'],
          defaultValues: {
            firstName: 'initial',
            lastName: 'value',
          },
        });

        return (
          <form>
            <input {...register('firstName')} placeholder="firstName" />
            <input {...register('lastName')} placeholder="lastName" />
            <button
              type="button"
              onClick={() => reset({ firstName: 'reset', lastName: 'values' })}
              data-testid="reset-form"
            >
              Reset
            </button>
          </form>
        );
      }

      render(<App />);

      // Verify initial disabled state
      await waitFor(() => {
        expect(
          (screen.getByPlaceholderText('firstName') as HTMLInputElement)
            .disabled,
        ).toBeTruthy();
        expect(
          (screen.getByPlaceholderText('lastName') as HTMLInputElement)
            .disabled,
        ).toBeFalsy();
      });

      // Reset the form
      fireEvent.click(screen.getByTestId('reset-form'));

      // Verify disabled state is maintained after reset
      await waitFor(() => {
        expect(
          (screen.getByPlaceholderText('firstName') as HTMLInputElement)
            .disabled,
        ).toBeTruthy();
        expect(
          (screen.getByPlaceholderText('lastName') as HTMLInputElement)
            .disabled,
        ).toBeFalsy();
        expect(
          (screen.getByPlaceholderText('firstName') as HTMLInputElement).value,
        ).toBe('reset');
      });
    });

    it('should handle switching between boolean and array disabled modes', async () => {
      function App() {
        const [disabledMode, setDisabledMode] = useState<'boolean' | 'array'>(
          'boolean',
        );
        const disabled = disabledMode === 'boolean' ? true : ['firstName'];

        const { register } = useForm({
          disabled,
          defaultValues: {
            firstName: '',
            lastName: '',
          },
        });

        return (
          <form>
            <input {...register('firstName')} placeholder="firstName" />
            <input {...register('lastName')} placeholder="lastName" />
            <button
              type="button"
              onClick={() =>
                setDisabledMode(
                  disabledMode === 'boolean' ? 'array' : 'boolean',
                )
              }
              data-testid="toggle-mode"
            >
              Toggle Mode
            </button>
          </form>
        );
      }

      render(<App />);

      // Initially both should be disabled (boolean mode)
      await waitFor(() => {
        expect(
          (screen.getByPlaceholderText('firstName') as HTMLInputElement)
            .disabled,
        ).toBeTruthy();
        expect(
          (screen.getByPlaceholderText('lastName') as HTMLInputElement)
            .disabled,
        ).toBeTruthy();
      });

      // Switch to array mode
      fireEvent.click(screen.getByTestId('toggle-mode'));

      // Now only firstName should be disabled (array mode)
      await waitFor(() => {
        expect(
          (screen.getByPlaceholderText('firstName') as HTMLInputElement)
            .disabled,
        ).toBeTruthy();
        expect(
          (screen.getByPlaceholderText('lastName') as HTMLInputElement)
            .disabled,
        ).toBeFalsy();
      });

      // Switch back to boolean mode
      fireEvent.click(screen.getByTestId('toggle-mode'));

      // Both should be disabled again
      await waitFor(() => {
        expect(
          (screen.getByPlaceholderText('firstName') as HTMLInputElement)
            .disabled,
        ).toBeTruthy();
        expect(
          (screen.getByPlaceholderText('lastName') as HTMLInputElement)
            .disabled,
        ).toBeTruthy();
      });
    });
  });

  describe('Integration tests', () => {
    it('should work correctly with mixed register and Controller components', async () => {
      function App() {
        const { register, control } = useForm({
          disabled: ['registerField', 'controllerField'],
          defaultValues: {
            registerField: '',
            controllerField: '',
            enabledField: '',
          },
        });

        return (
          <form>
            <input {...register('registerField')} placeholder="registerField" />
            <input {...register('enabledField')} placeholder="enabledField" />
            <Controller
              control={control}
              name="controllerField"
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="controllerField"
                  data-testid="controller-field"
                />
              )}
            />
          </form>
        );
      }

      render(<App />);

      await waitFor(() => {
        expect(
          (screen.getByPlaceholderText('registerField') as HTMLInputElement)
            .disabled,
        ).toBeTruthy();
        expect(
          (screen.getByPlaceholderText('enabledField') as HTMLInputElement)
            .disabled,
        ).toBeFalsy();
        expect(screen.getByTestId('controller-field')).toBeDisabled();
      });
    });

    it('should respect field-level disabled overrides in mixed scenarios', async () => {
      function App() {
        const { register } = useForm({
          disabled: ['field1', 'field2'],
          defaultValues: {
            field1: '',
            field2: '',
            field3: '',
          },
        });

        return (
          <form>
            {/* This should be disabled by array */}
            <input {...register('field1')} placeholder="field1" />

            {/* This should override array disabled with field-level enabled */}
            <input
              {...register('field2', { disabled: false })}
              placeholder="field2"
            />

            {/* This should be disabled by field-level despite not being in array */}
            <input
              {...register('field3', { disabled: true })}
              placeholder="field3"
            />
          </form>
        );
      }

      render(<App />);

      await waitFor(() => {
        expect(
          (screen.getByPlaceholderText('field1') as HTMLInputElement).disabled,
        ).toBeTruthy(); // Disabled by array
        expect(
          (screen.getByPlaceholderText('field2') as HTMLInputElement).disabled,
        ).toBeFalsy(); // Field-level override
        expect(
          (screen.getByPlaceholderText('field3') as HTMLInputElement).disabled,
        ).toBeTruthy(); // Field-level disabled
      });
    });

    it('should handle form submission correctly with disabled arrays', async () => {
      let submittedData: any = null;

      function App() {
        const { register, handleSubmit } = useForm({
          disabled: ['disabledField'],
          defaultValues: {
            enabledField: 'enabled-value',
            disabledField: 'disabled-value',
          },
        });

        const onSubmit = (data: any) => {
          submittedData = data;
        };

        return (
          <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('enabledField')} placeholder="enabledField" />
            <input {...register('disabledField')} placeholder="disabledField" />
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </form>
        );
      }

      render(<App />);

      // Submit the form
      fireEvent.click(screen.getByTestId('submit'));

      await waitFor(() => {
        expect(submittedData).toEqual({
          enabledField: 'enabled-value',
          // disabledField should be excluded from submission
        });
      });
    });
  });
});
