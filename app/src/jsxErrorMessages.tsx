import React from 'react';
import { useForm } from '@bombillazo/rhf-plus';

type FormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function JsxErrorMessagesExample() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
  };

  const triggerCustomError = () => {
    setError('username', {
      type: 'custom',
      message: (
        <div style={{ color: '#e74c3c' }}>
          <strong>🚨 Custom JSX Error!</strong>
          <br />
          <span>This username is already taken. Try:</span>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>user123</li>
            <li>cooluser2024</li>
            <li>myawesomename</li>
          </ul>
        </div>
      ),
    });
  };

  const validatePasswordStrength = (value: string) => {
    if (value.length < 8) {
      return (
        <div
          style={{
            color: '#e67e22',
            padding: '8px',
            backgroundColor: '#fef9e7',
            border: '1px solid #f39c12',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            ⚠️ Password too weak
          </div>
          <div>Must be at least 8 characters (current: {value.length})</div>
        </div>
      );
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return (
        <div
          style={{
            color: '#e67e22',
            padding: '8px',
            backgroundColor: '#fef9e7',
            border: '1px solid #f39c12',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            🔐 Password requirements:
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '14px' }}>
            <li style={{ color: hasUpperCase ? '#27ae60' : '#e74c3c' }}>
              {hasUpperCase ? '✓' : '✗'} Uppercase letter
            </li>
            <li style={{ color: hasLowerCase ? '#27ae60' : '#e74c3c' }}>
              {hasLowerCase ? '✓' : '✗'} Lowercase letter
            </li>
            <li style={{ color: hasNumbers ? '#27ae60' : '#e74c3c' }}>
              {hasNumbers ? '✓' : '✗'} Number
            </li>
            <li style={{ color: hasSpecialChar ? '#27ae60' : '#e74c3c' }}>
              {hasSpecialChar ? '✓' : '✗'} Special character
            </li>
          </ul>
        </div>
      );
    }

    return true;
  };

  const validateEmailFormat = (value: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(value)) {
      return (
        <div style={{ color: '#e74c3c' }}>
          <span>📧 Please enter a valid email address</span>
          <br />
          <small style={{ color: '#7f8c8d' }}>Example: user@example.com</small>
        </div>
      );
    }
    return true;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>JSX Error Messages Example</h2>
      <p>
        This demo showcases JSX/ReactElement support in error messages, allowing
        for rich, formatted error displays with custom styling and interactive
        content.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {/* Username Field */}
        <div>
          <label
            htmlFor="username"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
            }}
          >
            Username:
          </label>
          <input
            id="username"
            {...register('username', {
              required: (
                <span style={{ color: '#e74c3c' }}>
                  <strong>Username is required</strong> 📝
                </span>
              ),
              minLength: {
                value: 3,
                message: (
                  <div style={{ color: '#e67e22' }}>
                    Username must be at least <strong>3 characters</strong> long
                    <br />
                    <em>Choose something memorable!</em>
                  </div>
                ),
              },
            })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            placeholder="Enter your username"
          />
          <button
            type="button"
            onClick={triggerCustomError}
            style={{
              marginTop: '5px',
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            Trigger Custom JSX Error
          </button>
          {errors.username && (
            <div style={{ marginTop: '8px' }}>{errors.username.message}</div>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
            }}
          >
            Email:
          </label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: (
                <span style={{ color: '#e74c3c' }}>
                  📬 Email address is required
                </span>
              ),
              validate: validateEmailFormat,
            })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            placeholder="user@example.com"
          />
          {errors.email && (
            <div style={{ marginTop: '8px' }}>{errors.email.message}</div>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
            }}
          >
            Password:
          </label>
          <input
            id="password"
            type="password"
            {...register('password', {
              required: (
                <span style={{ color: '#e74c3c' }}>
                  🔒 Password is required for account security
                </span>
              ),
              validate: validatePasswordStrength,
            })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            placeholder="Enter a strong password"
          />
          {errors.password && (
            <div style={{ marginTop: '8px' }}>{errors.password.message}</div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirmPassword"
            style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
            }}
          >
            Confirm Password:
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', {
              required: (
                <span style={{ color: '#e74c3c' }}>
                  🔄 Please confirm your password
                </span>
              ),
              validate: (value, { password }) => {
                if (value !== password) {
                  return (
                    <div
                      style={{
                        color: '#e74c3c',
                        padding: '8px',
                        backgroundColor: '#fadbd8',
                        border: '1px solid #e74c3c',
                        borderRadius: '4px',
                      }}
                    >
                      <strong>⚠️ Passwords do not match</strong>
                      <br />
                      <span>
                        Please ensure both password fields are identical.
                      </span>
                    </div>
                  );
                }
                return true;
              },
            })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <div style={{ marginTop: '8px' }}>
              {errors.confirmPassword.message}
            </div>
          )}
        </div>

        <button
          type="submit"
          style={{
            padding: '12px',
            backgroundColor: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Submit Form
        </button>
      </form>

      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          borderLeft: '4px solid #3498db',
        }}
      >
        <h3 style={{ color: '#2c3e50', marginTop: 0 }}>
          💡 Features Demonstrated:
        </h3>
        <ul style={{ color: '#34495e' }}>
          <li>
            <strong>Rich JSX Elements:</strong> Styled error messages with HTML
            formatting
          </li>
          <li>
            <strong>React Components:</strong> Custom components as error
            messages
          </li>
          <li>
            <strong>Custom Validation:</strong> Complex validation logic with
            visual feedback
          </li>
          <li>
            <strong>Programmatic Errors:</strong> Dynamic error messages with
            setError
          </li>
          <li>
            <strong>Conditional Styling:</strong> Color-coded validation states
          </li>
          <li>
            <strong>Backward Compatibility:</strong> Works alongside traditional
            string messages
          </li>
        </ul>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#ecf0f1',
          borderRadius: '4px',
        }}
      >
        <h4>Usage Example:</h4>
        <pre
          style={{
            fontSize: '12px',
            overflow: 'auto',
            backgroundColor: '#ffffff',
            padding: '10px',
            borderRadius: '3px',
          }}
        >
          {`// JSX error message in validation rules
register('field', {
  required: (
    <span style={{ color: 'red' }}>
      <strong>This field is required!</strong>
    </span>
  ),
  validate: (value) => {
    if (value.length < 5) {
      return (
        <div>
          Too short! Need at least <em>5 characters</em>
        </div>
      );
    }
    return true;
  }
})

// Programmatic JSX error
setError('field', {
  type: 'custom',
  message: <CustomErrorComponent field="field" />
});`}
        </pre>
      </div>
    </div>
  );
}
