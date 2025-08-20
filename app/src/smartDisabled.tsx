import React from 'react';
import { useForm, Controller } from '@bombillazo/rhf-plus';

export default function EnhancedDisabled() {
  const [disabledMode, setDisabledMode] = React.useState<
    'none' | 'boolean' | 'array'
  >('array');
  const [arrayDisabledFields, setArrayDisabledFields] = React.useState([
    'firstName',
    'email',
  ]);

  // Determine disabled value based on mode
  const getDisabledValue = () => {
    switch (disabledMode) {
      case 'boolean':
        return true;
      case 'array':
        return arrayDisabledFields;
      default:
        return false;
    }
  };

  const { register, control, handleSubmit, formState, reset } = useForm({
    disabled: getDisabledValue(),
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      alwaysEnabled: '',
      alwaysDisabled: '',
      controllerField: '',
      controllerOverride: '',
      controllerDisabled: '',
      address: {
        street: '123 Main St',
        city: 'New York',
        zip: '10001',
      },
    },
  });

  // Update disabled state when mode changes
  React.useEffect(() => {
    if (control._disableForm) {
      // Add small delay to ensure state is updated
      setTimeout(() => {
        control._disableForm(getDisabledValue());
      }, 10);
    }
  }, [disabledMode, arrayDisabledFields, control]);

  const onSubmit = (data: any) => {
    alert(`Form submitted with data: ${JSON.stringify(data, null, 2)}`);
  };

  const toggleFieldInArray = (fieldName: string) => {
    setArrayDisabledFields((current) =>
      current.includes(fieldName)
        ? current.filter((field) => field !== fieldName)
        : [...current, fieldName],
    );
  };

  return (
    <div>
      <h1>Smart Disabled State Testing</h1>

      {/* Mode Controls */}
      <div
        style={{
          marginBottom: '20px',
          padding: '10px',
          border: '1px solid #ccc',
        }}
      >
        <h3>Disabled Mode Controls:</h3>
        <button
          type="button"
          onClick={() => setDisabledMode('none')}
          data-testid="mode-none"
          style={{
            backgroundColor: disabledMode === 'none' ? '#007bff' : '#ccc',
            color: 'white',
            margin: '5px',
          }}
        >
          None (disabled: false)
        </button>
        <button
          type="button"
          onClick={() => setDisabledMode('boolean')}
          data-testid="mode-boolean"
          style={{
            backgroundColor: disabledMode === 'boolean' ? '#007bff' : '#ccc',
            color: 'white',
            margin: '5px',
          }}
        >
          Boolean (disabled: true)
        </button>
        <button
          type="button"
          onClick={() => setDisabledMode('array')}
          data-testid="mode-array"
          style={{
            backgroundColor: disabledMode === 'array' ? '#007bff' : '#ccc',
            color: 'white',
            margin: '5px',
          }}
        >
          Array Mode
        </button>

        <div style={{ marginTop: '10px' }}>
          <strong>Current mode:</strong>{' '}
          <span data-testid="current-mode">{disabledMode}</span>
        </div>
        <div>
          <strong>Current disabled value:</strong>{' '}
          <span data-testid="current-disabled-value">
            {JSON.stringify(getDisabledValue())}
          </span>
        </div>
      </div>

      {/* Array Mode Controls */}
      {disabledMode === 'array' && (
        <div
          style={{
            marginBottom: '20px',
            padding: '10px',
            border: '1px solid #orange',
          }}
        >
          <h3>Array Mode Field Controls:</h3>
          <button
            type="button"
            onClick={() => toggleFieldInArray('firstName')}
            data-testid="toggle-firstName"
          >
            Toggle firstName (
            {arrayDisabledFields.includes('firstName') ? 'disabled' : 'enabled'}
            )
          </button>
          <button
            type="button"
            onClick={() => toggleFieldInArray('lastName')}
            data-testid="toggle-lastName"
          >
            Toggle lastName (
            {arrayDisabledFields.includes('lastName') ? 'disabled' : 'enabled'})
          </button>
          <button
            type="button"
            onClick={() => toggleFieldInArray('email')}
            data-testid="toggle-email"
          >
            Toggle email (
            {arrayDisabledFields.includes('email') ? 'disabled' : 'enabled'})
          </button>
          <button
            type="button"
            onClick={() => toggleFieldInArray('phone')}
            data-testid="toggle-phone"
          >
            Toggle phone (
            {arrayDisabledFields.includes('phone') ? 'disabled' : 'enabled'})
          </button>
          <button
            type="button"
            onClick={() => toggleFieldInArray('address.city')}
            data-testid="toggle-nested"
          >
            Toggle nested city (
            {arrayDisabledFields.includes('address.city')
              ? 'disabled'
              : 'enabled'}
            )
          </button>

          <div style={{ marginTop: '10px' }}>
            <strong>Array disabled fields:</strong>{' '}
            <span data-testid="array-fields">
              [{arrayDisabledFields.join(', ')}]
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Regular register fields */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Register Fields:</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>First Name: </label>
            <input {...register('firstName')} data-testid="firstName" />
            <span style={{ marginLeft: '10px', color: '#666' }}>
              Status: {formState.disabled ? 'form-disabled' : 'enabled'}
            </span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Last Name: </label>
            <input {...register('lastName')} data-testid="lastName" />
            <span style={{ marginLeft: '10px', color: '#666' }}>
              Status: {formState.disabled ? 'form-disabled' : 'enabled'}
            </span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Email: </label>
            <input {...register('email')} data-testid="email" />
            <span style={{ marginLeft: '10px', color: '#666' }}>
              Status: {formState.disabled ? 'form-disabled' : 'enabled'}
            </span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Phone: </label>
            <input {...register('phone')} data-testid="phone" />
            <span style={{ marginLeft: '10px', color: '#666' }}>
              Status: {formState.disabled ? 'form-disabled' : 'enabled'}
            </span>
          </div>
        </div>

        {/* Field-level override examples */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Field-level Override Examples:</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>Always Enabled (disabled: false): </label>
            <input
              {...register('alwaysEnabled', { disabled: false })}
              data-testid="always-enabled"
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Always Disabled (disabled: true): </label>
            <input
              {...register('alwaysDisabled', { disabled: true })}
              data-testid="always-disabled"
            />
          </div>
        </div>

        {/* Nested fields */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Nested Fields:</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>Street: </label>
            <input
              {...register('address.street')}
              data-testid="address-street"
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>City: </label>
            <input {...register('address.city')} data-testid="address-city" />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>ZIP: </label>
            <input {...register('address.zip')} data-testid="address-zip" />
          </div>
        </div>

        {/* Controller examples */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Controller Fields:</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>Controller Field: </label>
            <Controller
              control={control}
              name="controllerField"
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Controller field"
                  data-testid="controller-field"
                />
              )}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Controller Override (disabled: false): </label>
            <Controller
              control={control}
              name="controllerOverride"
              disabled={false}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Controller override"
                  data-testid="controller-override"
                />
              )}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Controller Always Disabled: </label>
            <Controller
              control={control}
              name="controllerDisabled"
              disabled={true}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Controller always disabled"
                  data-testid="controller-disabled"
                />
              )}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ marginTop: '20px' }}>
          <button type="submit" data-testid="submit-form">
            Submit Form
          </button>
          <button
            type="button"
            onClick={() => reset()}
            data-testid="reset-form"
          >
            Reset Form
          </button>
        </div>

        {/* Debug Info */}
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#f5f5f5',
          }}
        >
          <h3>Debug Info:</h3>
          <div>
            Form disabled state:{' '}
            <span data-testid="form-disabled">
              {JSON.stringify(formState.disabled)}
            </span>
          </div>
          <div>
            Is submitting:{' '}
            <span data-testid="is-submitting">
              {JSON.stringify(formState.isSubmitting)}
            </span>
          </div>
          <div>
            Is valid:{' '}
            <span data-testid="is-valid">
              {JSON.stringify(formState.isValid)}
            </span>
          </div>
          <div>
            Errors:{' '}
            <span data-testid="form-errors">
              {JSON.stringify(formState.errors)}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
