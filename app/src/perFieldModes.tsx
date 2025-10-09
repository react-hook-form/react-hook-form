import React from 'react';
import { useForm } from '@bombillazo/rhf-plus';

let renderCounter = 0;

const PerFieldModes: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    defaultField: string;
    onChangeField: string;
    onBlurField: string;
    mixedRevalidate: string;
  }>({
    mode: 'onSubmit', // Form default
    reValidateMode: 'onChange', // Form default revalidation
  });

  const onSubmit = () => {};

  renderCounter++;

  return (
    <div>
      <h1>Per-Field Validation Modes</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Uses form default (onSubmit) */}
        <div>
          <label>Default Field (onSubmit):</label>
          <input
            {...register('defaultField', {
              required: 'Default field is required',
            })}
            placeholder="Default field"
            data-testid="defaultField"
          />
          {errors.defaultField && (
            <p data-testid="defaultFieldError">{errors.defaultField.message}</p>
          )}
        </div>

        {/* Override to onChange */}
        <div>
          <label>onChange Field:</label>
          <input
            {...register('onChangeField', {
              required: 'onChange field is required',
              mode: 'onChange',
            })}
            placeholder="onChange field"
            data-testid="onChangeField"
          />
          {errors.onChangeField && (
            <p data-testid="onChangeFieldError">
              {errors.onChangeField.message}
            </p>
          )}
        </div>

        {/* Override to onBlur for both mode and reValidateMode */}
        <div>
          <label>onBlur Field:</label>
          <input
            {...register('onBlurField', {
              required: 'onBlur field is required',
              mode: 'onBlur',
              reValidateMode: 'onBlur', // Also use onBlur for revalidation
            })}
            placeholder="onBlur field"
            data-testid="onBlurField"
          />
          {errors.onBlurField && (
            <p data-testid="onBlurFieldError">{errors.onBlurField.message}</p>
          )}
        </div>

        {/* Override only reValidateMode, use form's mode (onSubmit) */}
        <div>
          <label>Mixed Revalidate (onBlur revalidate):</label>
          <input
            {...register('mixedRevalidate', {
              required: 'Mixed field is required',
              reValidateMode: 'onBlur', // Only revalidate on blur after submit
            })}
            placeholder="Mixed revalidate field"
            data-testid="mixedRevalidate"
          />
          {errors.mixedRevalidate && (
            <p data-testid="mixedRevalidateError">
              {errors.mixedRevalidate.message}
            </p>
          )}
        </div>

        <button type="submit" data-testid="submit">
          Submit
        </button>
        <div data-testid="renderCount">{renderCounter}</div>
      </form>
    </div>
  );
};

export default PerFieldModes;
