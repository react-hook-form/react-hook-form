import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useForm } from '../useForm';

describe('readonly field validation', () => {
  describe('with shouldSkipReadOnlyValidation disabled (default - backwards compatible)', () => {
    it('should validate readonly fields normally', async () => {
      const onSubmit = jest.fn();
      const onInvalid = jest.fn();

      const App = () => {
        const {
          register,
          handleSubmit,
          formState: { errors },
        } = useForm();

        return (
          <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
            <input
              {...register('readonlyField', {
                required: 'This field is required',
              })}
              readOnly
              data-testid="readonly-field"
            />
            <input
              {...register('normalField', {
                required: 'This field is required',
              })}
              data-testid="normal-field"
            />
            <button type="submit">Submit</button>
            {errors.readonlyField && (
              <p data-testid="readonly-error">
                {String(errors.readonlyField.message)}
              </p>
            )}
            {errors.normalField && (
              <p data-testid="normal-error">
                {String(errors.normalField.message)}
              </p>
            )}
          </form>
        );
      };

      render(<App />);

      const readonlyField = screen.getByTestId('readonly-field');
      const normalField = screen.getByTestId('normal-field');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      // Both fields start empty
      expect(readonlyField).toHaveValue('');
      expect(normalField).toHaveValue('');

      // Try to submit the form
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Both fields should show validation errors (backwards compatible behavior)
        expect(screen.getByTestId('normal-error')).toBeInTheDocument();
        expect(screen.getByTestId('readonly-error')).toBeInTheDocument();
      });

      // onInvalid should be called because both fields are invalid
      expect(onInvalid).toHaveBeenCalledWith(
        {
          normalField: {
            type: 'required',
            message: 'This field is required',
            ref: normalField,
          },
          readonlyField: {
            type: 'required',
            message: 'This field is required',
            ref: readonlyField,
          },
        },
        expect.any(Object),
      );

      // onSubmit should not be called
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should update form values for readonly fields and still validate them', async () => {
      let formValues: any = {};

      const App = () => {
        const {
          register,
          watch,
          formState: { errors },
        } = useForm();
        formValues = watch();

        return (
          <div>
            <input
              {...register('readonlyField', {
                required: 'This field is required',
                minLength: { value: 5, message: 'Minimum 5 characters' },
              })}
              readOnly
              data-testid="readonly-field"
              defaultValue="test"
            />
            {errors.readonlyField && (
              <p data-testid="readonly-error">
                {String(errors.readonlyField.message)}
              </p>
            )}
          </div>
        );
      };

      render(<App />);

      const readonlyField = screen.getByTestId('readonly-field');

      // Check initial value
      expect(readonlyField).toHaveValue('test');
      expect(formValues.readonlyField).toBe('test');

      // Simulate programmatic value change (e.g., by another script)
      fireEvent.change(readonlyField, { target: { value: 'ab' } });

      await waitFor(() => {
        // Value should be updated in form state
        expect(formValues.readonlyField).toBe('ab');
      });

      // Validation errors don't appear until validation is triggered (submission, blur, etc.)
      // But the field is still subject to validation rules when flag is disabled
      expect(screen.queryByTestId('readonly-error')).not.toBeInTheDocument();
    });

    it('should handle readonly fields with other validation rules properly', async () => {
      const validate = jest.fn(() => 'Custom validation error');
      const onSubmit = jest.fn();

      const App = () => {
        const {
          register,
          handleSubmit,
          formState: { errors },
        } = useForm();

        return (
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              {...register('readonlyField', {
                required: 'Required',
                minLength: { value: 10, message: 'Too short' },
                maxLength: { value: 50, message: 'Too long' },
                pattern: { value: /^[A-Z]+$/, message: 'Must be uppercase' },
                validate,
              })}
              readOnly
              data-testid="readonly-field"
              defaultValue="TESTVALUEOK"
            />
            <button type="submit">Submit</button>
            {errors.readonlyField && (
              <p data-testid="readonly-error">
                {String(errors.readonlyField.message)}
              </p>
            )}
          </form>
        );
      };

      render(<App />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });

      // Submit the form
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Custom validation function SHOULD be called for readonly fields when flag is disabled
        expect(validate).toHaveBeenCalledWith('TESTVALUEOK', {
          readonlyField: 'TESTVALUEOK',
        });
        // Validation errors SHOULD appear
        expect(screen.getByTestId('readonly-error')).toBeInTheDocument();
      });

      // Form should NOT submit since readonly field validation failed
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should still update touched and dirty state for readonly fields', async () => {
      let capturedFormState: any = {};

      const App = () => {
        const { register, formState } = useForm();
        capturedFormState = formState;

        return (
          <div>
            <input
              {...register('readonlyField')}
              readOnly
              data-testid="readonly-field"
            />
          </div>
        );
      };

      render(<App />);

      const readonlyField = screen.getByTestId('readonly-field');

      // Initially not touched or dirty
      expect(capturedFormState.touchedFields.readonlyField).toBeFalsy();
      expect(capturedFormState.dirtyFields.readonlyField).toBeFalsy();

      // Change the value
      fireEvent.change(readonlyField, { target: { value: 'test' } });

      await waitFor(() => {
        // Should be marked as dirty
        expect(capturedFormState.dirtyFields.readonlyField).toBeTruthy();
      });

      // Blur the field
      fireEvent.blur(readonlyField);

      await waitFor(() => {
        // Should be marked as touched
        expect(capturedFormState.touchedFields.readonlyField).toBeTruthy();
      });
    });

    it('should not interfere with disabled field behavior', async () => {
      const onSubmit = jest.fn();
      const onInvalid = jest.fn();

      const App = () => {
        const {
          register,
          handleSubmit,
          formState: { errors },
        } = useForm();

        return (
          <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
            <input
              {...register('readonlyField', { required: 'Required' })}
              readOnly
              data-testid="readonly-field"
            />
            <input
              {...register('disabledField', {
                required: 'Required',
                disabled: true,
              })}
              data-testid="disabled-field"
            />
            <button type="submit">Submit</button>
            {errors.readonlyField && (
              <p data-testid="readonly-error">
                {String(errors.readonlyField.message)}
              </p>
            )}
            {errors.disabledField && (
              <p data-testid="disabled-error">
                {String(errors.disabledField.message)}
              </p>
            )}
          </form>
        );
      };

      render(<App />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });

      // Submit the form
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Readonly field SHOULD show validation error when flag is disabled
        expect(screen.getByTestId('readonly-error')).toBeInTheDocument();
        // Disabled field should NOT show validation error (always skipped)
        expect(screen.queryByTestId('disabled-error')).not.toBeInTheDocument();
      });

      // Form should NOT submit since readonly field validation failed
      expect(onSubmit).not.toHaveBeenCalled();
      expect(onInvalid).toHaveBeenCalled();
    });
  });

  describe('with shouldSkipReadOnlyValidation enabled (new behavior)', () => {
    it('should skip validation for readonly fields', async () => {
      const onSubmit = jest.fn();
      const onInvalid = jest.fn();

      const App = () => {
        const {
          register,
          handleSubmit,
          formState: { errors },
        } = useForm({
          shouldSkipReadOnlyValidation: true,
        });

        return (
          <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
            <input
              {...register('readonlyField', {
                required: 'This field is required',
              })}
              readOnly
              data-testid="readonly-field"
            />
            <input
              {...register('normalField', {
                required: 'This field is required',
              })}
              data-testid="normal-field"
            />
            <button type="submit">Submit</button>
            {errors.readonlyField && (
              <p data-testid="readonly-error">
                {String(errors.readonlyField.message)}
              </p>
            )}
            {errors.normalField && (
              <p data-testid="normal-error">
                {String(errors.normalField.message)}
              </p>
            )}
          </form>
        );
      };

      render(<App />);

      const readonlyField = screen.getByTestId('readonly-field');
      const normalField = screen.getByTestId('normal-field');
      const submitButton = screen.getByRole('button', { name: 'Submit' });

      // Both fields start empty
      expect(readonlyField).toHaveValue('');
      expect(normalField).toHaveValue('');

      // Try to submit the form
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Normal field should show validation error
        expect(screen.getByTestId('normal-error')).toBeInTheDocument();
        // Readonly field should NOT show validation error
        expect(screen.queryByTestId('readonly-error')).not.toBeInTheDocument();
      });

      // onInvalid should be called because normal field is invalid
      expect(onInvalid).toHaveBeenCalledWith(
        {
          normalField: {
            type: 'required',
            message: 'This field is required',
            ref: normalField,
          },
        },
        expect.any(Object),
      );

      // onSubmit should not be called
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should update form values for readonly fields but skip validation', async () => {
      let formValues: any = {};

      const App = () => {
        const {
          register,
          watch,
          formState: { errors },
        } = useForm({
          shouldSkipReadOnlyValidation: true,
        });
        formValues = watch();

        return (
          <div>
            <input
              {...register('readonlyField', {
                required: 'This field is required',
                minLength: { value: 5, message: 'Minimum 5 characters' },
              })}
              readOnly
              data-testid="readonly-field"
              defaultValue="test"
            />
            {errors.readonlyField && (
              <p data-testid="readonly-error">
                {String(errors.readonlyField.message)}
              </p>
            )}
          </div>
        );
      };

      render(<App />);

      const readonlyField = screen.getByTestId('readonly-field');

      // Check initial value
      expect(readonlyField).toHaveValue('test');
      expect(formValues.readonlyField).toBe('test');

      // Simulate programmatic value change (e.g., by another script)
      fireEvent.change(readonlyField, { target: { value: 'ab' } });

      await waitFor(() => {
        // Value should be updated in form state
        expect(formValues.readonlyField).toBe('ab');
      });

      // No validation errors should appear even though value is less than minLength
      expect(screen.queryByTestId('readonly-error')).not.toBeInTheDocument();
    });

    it('should handle readonly fields with all validation rules properly', async () => {
      const validate = jest.fn(() => 'Custom validation error');
      const onSubmit = jest.fn();

      const App = () => {
        const {
          register,
          handleSubmit,
          formState: { errors },
        } = useForm({
          shouldSkipReadOnlyValidation: true,
        });

        return (
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              {...register('readonlyField', {
                required: 'Required',
                minLength: { value: 10, message: 'Too short' },
                maxLength: { value: 50, message: 'Too long' },
                pattern: { value: /^[A-Z]+$/, message: 'Must be uppercase' },
                validate,
              })}
              readOnly
              data-testid="readonly-field"
              defaultValue="test"
            />
            <button type="submit">Submit</button>
            {errors.readonlyField && (
              <p data-testid="readonly-error">
                {String(errors.readonlyField.message)}
              </p>
            )}
          </form>
        );
      };

      render(<App />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });

      // Submit the form
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Custom validation function should NOT be called for readonly fields
        expect(validate).not.toHaveBeenCalled();
        // No validation errors should appear
        expect(screen.queryByTestId('readonly-error')).not.toBeInTheDocument();
      });

      // Form should submit successfully since readonly field validation is skipped
      expect(onSubmit).toHaveBeenCalledWith(
        { readonlyField: 'test' },
        expect.any(Object),
      );
    });

    it('should not interfere with disabled field behavior', async () => {
      const onSubmit = jest.fn();
      const onInvalid = jest.fn();

      const App = () => {
        const {
          register,
          handleSubmit,
          formState: { errors },
        } = useForm({
          shouldSkipReadOnlyValidation: true,
        });

        return (
          <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
            <input
              {...register('readonlyField', { required: 'Required' })}
              readOnly
              data-testid="readonly-field"
            />
            <input
              {...register('disabledField', {
                required: 'Required',
                disabled: true,
              })}
              data-testid="disabled-field"
            />
            <button type="submit">Submit</button>
            {errors.readonlyField && (
              <p data-testid="readonly-error">
                {String(errors.readonlyField.message)}
              </p>
            )}
            {errors.disabledField && (
              <p data-testid="disabled-error">
                {String(errors.disabledField.message)}
              </p>
            )}
          </form>
        );
      };

      render(<App />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });

      // Submit the form
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Neither readonly nor disabled fields should show validation errors
        expect(screen.queryByTestId('readonly-error')).not.toBeInTheDocument();
        expect(screen.queryByTestId('disabled-error')).not.toBeInTheDocument();
      });

      // Form should submit successfully since both fields skip validation
      expect(onSubmit).toHaveBeenCalled();
      expect(onInvalid).not.toHaveBeenCalled();
    });
  });
});
