import React from 'react';
import {
  useController,
  UseControllerReturn,
  useForm,
} from '@bombillazo/rhf-plus';

export default function ScrollIntoViewExample() {
  const { control } = useForm<{
    firstName: string;
    lastName: string;
    email: string;
    message: string;
  }>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      message: '',
    },
  });

  const firstNameController = useController({
    name: 'firstName',
    control,
    rules: { required: 'First name is required' },
  });

  const lastNameController = useController({
    name: 'lastName',
    control,
    rules: { required: 'Last name is required' },
  });

  const emailController = useController({
    name: 'email',
    control,
    rules: {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address',
      },
    },
  });

  const messageController = useController({
    name: 'message',
    control,
    rules: { required: 'Message is required' },
  });

  const handleScrollToField = (
    fieldController: UseControllerReturn<any, any>,
  ) => {
    if (fieldController.field.ref.scrollIntoView) {
      fieldController.field.ref.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>ScrollIntoView Example</h2>
      <p>
        This demo shows the new scrollIntoView method available on field refs.
        Click the buttons to smoothly scroll to each field.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => handleScrollToField(firstNameController)}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Scroll to First Name
        </button>
        <button
          type="button"
          onClick={() => handleScrollToField(lastNameController)}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Scroll to Last Name
        </button>
        <button
          type="button"
          onClick={() => handleScrollToField(emailController)}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Scroll to Email
        </button>
        <button
          type="button"
          onClick={() => handleScrollToField(messageController)}
          style={{ padding: '8px 16px' }}
        >
          Scroll to Message
        </button>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '80vh' }}>
        <div>
          <label htmlFor="firstName">First Name:</label>
          <input
            id="firstName"
            {...firstNameController.field}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {firstNameController.fieldState.error && (
            <p style={{ color: 'red', fontSize: '14px' }}>
              {firstNameController.fieldState.error.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="lastName">Last Name:</label>
          <input
            id="lastName"
            {...lastNameController.field}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {lastNameController.fieldState.error && (
            <p style={{ color: 'red', fontSize: '14px' }}>
              {lastNameController.fieldState.error.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            {...emailController.field}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          {emailController.fieldState.error && (
            <p style={{ color: 'red', fontSize: '14px' }}>
              {emailController.fieldState.error.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            {...messageController.field}
            rows={4}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical',
            }}
          />
          {messageController.fieldState.error && (
            <p style={{ color: 'red', fontSize: '14px' }}>
              {messageController.fieldState.error.message}
            </p>
          )}
        </div>
      </form>

      <div
        style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
        }}
      >
        <h3>Usage Example:</h3>
        <pre style={{ fontSize: '14px', overflow: 'auto' }}>
          {`const { field } = useController({
  name: 'fieldName',
  control,
});

// Scroll to the field element
field.ref.scrollIntoView({
  behavior: 'smooth',
  block: 'center',
});`}
        </pre>
      </div>
    </div>
  );
}
