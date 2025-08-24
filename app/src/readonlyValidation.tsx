import React, { useState } from 'react';
import { useForm, type FieldErrors } from '@bombillazo/rhf-plus';

type FormData = {
  readonlyField: string;
  normalField: string;
  readonlyRequired: string;
  readonlyPattern: string;
  readonlyMinLength: string;
  readonlyCustom: string;
};

const ReadonlyValidation = () => {
  const [isReadonlyMode, setIsReadonlyMode] = useState(true);
  const [shouldSkipReadOnlyValidation, setShouldSkipReadOnlyValidation] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    setValue,
    getValues,
    watch,
    control,
  } = useForm<FormData>({
    defaultValues: {
      readonlyField: '', // Empty so it fails required validation
      normalField: '',
      readonlyRequired: '',
      readonlyPattern: 'invalid-pattern',
      readonlyMinLength: 'ab',
      readonlyCustom: 'fail',
    },
    shouldSkipReadOnlyValidation,
  });

  // Handle flag changes and readonly mode changes
  React.useEffect(() => {
    // When readonly mode changes, we need to update the tracking
    // because DOM readonly attributes have changed
    control._updateReadonlyFieldTracking();
    // Re-trigger validation to apply new behavior
    trigger();
  }, [shouldSkipReadOnlyValidation, isReadonlyMode, control, trigger]);

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
  };

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log('Form validation failed:', errors);
  };

  const customValidator = (value: string) => {
    return value === 'fail' ? 'Custom validation error' : true;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Readonly Field Validation Test</h1>

      <div style={{ marginBottom: '20px', padding: '10px' }}>
        <h2>Configuration Toggles</h2>

        <div style={{ marginBottom: '10px' }}>
          <button
            type="button"
            onClick={() => setIsReadonlyMode(!isReadonlyMode)}
            data-testid="toggle-readonly-mode"
            style={{ marginRight: '10px', padding: '8px 16px' }}
          >
            {isReadonlyMode ? 'Disable Readonly' : 'Enable Readonly'}
          </button>
          <span data-testid="readonly-mode-status">
            Fields Mode: {isReadonlyMode ? '🔒 READONLY' : '✏️ EDITABLE'}
          </span>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <button
            type="button"
            onClick={() =>
              setShouldSkipReadOnlyValidation(!shouldSkipReadOnlyValidation)
            }
            data-testid="toggle-skip-validation-flag"
            style={{ marginRight: '10px', padding: '8px 16px' }}
          >
            {shouldSkipReadOnlyValidation
              ? 'Disable Skip Flag'
              : 'Enable Skip Flag'}
          </button>
          <span data-testid="skip-validation-flag-status">
            shouldSkipReadOnlyValidation:{' '}
            {shouldSkipReadOnlyValidation ? '✅ TRUE' : '❌ FALSE'}
          </span>
        </div>

        <div
          style={{
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#666',
          }}
        >
          <strong>Expected Behavior:</strong>
          <br />
          Readonly fields should{' '}
          {shouldSkipReadOnlyValidation && isReadonlyMode
            ? 'NOT validate (new behavior)'
            : 'validate normally' +
              (isReadonlyMode && !shouldSkipReadOnlyValidation
                ? ' (backwards compatible)'
                : '')}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <div style={{ marginBottom: '20px' }}>
          <h2>Basic Readonly Field</h2>
          <label>
            Toggleable Readonly Field (should{' '}
            {isReadonlyMode && shouldSkipReadOnlyValidation ? 'not ' : ''}
            validate):
            {isReadonlyMode ? '🔒' : '✏️'}
            <input
              {...register('readonlyField', { required: 'Required' })}
              readOnly={isReadonlyMode}
              data-testid="readonly-field"
              style={{ marginLeft: '10px', width: '200px' }}
            />
          </label>
          {errors.readonlyField && (
            <div data-testid="readonly-field-error" style={{ color: 'red' }}>
              {String(errors.readonlyField.message)}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>
            Normal Field (should validate):
            <input
              {...register('normalField', { required: 'Required' })}
              data-testid="normal-field"
              style={{ marginLeft: '10px', width: '200px' }}
            />
          </label>
          {errors.normalField && (
            <div data-testid="normal-field-error" style={{ color: 'red' }}>
              {String(errors.normalField.message)}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>Dynamic Validation Rules</h2>

          <div style={{ marginBottom: '10px' }}>
            <label>
              Required (empty, should{' '}
              {isReadonlyMode && shouldSkipReadOnlyValidation ? 'not ' : ''}
              validate):
              {isReadonlyMode ? '🔒' : '✏️'}
              <input
                {...register('readonlyRequired', { required: 'Required' })}
                readOnly={isReadonlyMode}
                data-testid="readonly-required"
                style={{ marginLeft: '10px', width: '200px' }}
              />
            </label>
            {errors.readonlyRequired && (
              <div
                data-testid="readonly-required-error"
                style={{ color: 'red' }}
              >
                {String(errors.readonlyRequired.message)}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>
              Pattern (invalid pattern, should{' '}
              {isReadonlyMode && shouldSkipReadOnlyValidation ? 'not ' : ''}
              validate):
              {isReadonlyMode ? '🔒' : '✏️'}
              <input
                {...register('readonlyPattern', {
                  pattern: { value: /^[A-Z]+$/, message: 'Must be uppercase' },
                })}
                readOnly={isReadonlyMode}
                data-testid="readonly-pattern"
                style={{ marginLeft: '10px', width: '200px' }}
              />
            </label>
            {errors.readonlyPattern && (
              <div
                data-testid="readonly-pattern-error"
                style={{ color: 'red' }}
              >
                {String(errors.readonlyPattern.message)}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>
              MinLength (too short, should{' '}
              {isReadonlyMode && shouldSkipReadOnlyValidation ? 'not ' : ''}
              validate):
              {isReadonlyMode ? '🔒' : '✏️'}
              <input
                {...register('readonlyMinLength', {
                  minLength: { value: 5, message: 'Minimum 5 characters' },
                })}
                readOnly={isReadonlyMode}
                data-testid="readonly-minlength"
                style={{ marginLeft: '10px', width: '200px' }}
              />
            </label>
            {errors.readonlyMinLength && (
              <div
                data-testid="readonly-minlength-error"
                style={{ color: 'red' }}
              >
                {String(errors.readonlyMinLength.message)}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>
              Custom Validation (should fail, but{' '}
              {isReadonlyMode && shouldSkipReadOnlyValidation ? 'not ' : ''}
              validate):
              {isReadonlyMode ? '🔒' : '✏️'}
              <input
                {...register('readonlyCustom', {
                  validate: customValidator,
                })}
                readOnly={isReadonlyMode}
                data-testid="readonly-custom"
                style={{ marginLeft: '10px', width: '200px' }}
              />
            </label>
            {errors.readonlyCustom && (
              <div data-testid="readonly-custom-error" style={{ color: 'red' }}>
                {String(errors.readonlyCustom.message)}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>Form Actions</h2>
          <button
            type="submit"
            data-testid="submit-button"
            style={{ marginRight: '10px' }}
          >
            Submit
          </button>

          <button
            type="button"
            onClick={() => trigger()}
            data-testid="trigger-validation"
            style={{ marginRight: '10px' }}
          >
            Trigger Validation
          </button>

          <button
            type="button"
            onClick={() => setValue('readonlyField', 'new-value')}
            data-testid="set-readonly-value"
            style={{ marginRight: '10px' }}
          >
            Set Readonly Value
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>Form State</h2>
          <div data-testid="readonly-mode">
            Readonly Mode: {String(isReadonlyMode)}
          </div>
          <div data-testid="skip-validation-flag">
            shouldSkipReadOnlyValidation: {String(shouldSkipReadOnlyValidation)}
          </div>
          <div data-testid="form-valid">Is Valid: {String(isValid)}</div>
          <div data-testid="form-errors">
            Errors:{' '}
            {JSON.stringify(
              errors,
              (_, value) => {
                // Filter out DOM elements and other non-serializable values
                if (
                  value &&
                  typeof value === 'object' &&
                  value.constructor &&
                  value.constructor.name === 'HTMLInputElement'
                ) {
                  return '[HTMLInputElement]';
                }
                return value;
              },
              2,
            )}
          </div>
          <div data-testid="form-values">
            Values: {JSON.stringify(watch(), null, 2)}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReadonlyValidation;
