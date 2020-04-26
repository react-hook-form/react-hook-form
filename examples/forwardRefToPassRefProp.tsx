import React from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-hook-form';

const MyInput = React.forwardRef(
  ({ placeholder, id, type, name, className, children }, ref) => {
    return (
      <label htmlFor={id}>
        <input
          placeholder={placeholder}
          type={type}
          id={id}
          aria-label={placeholder}
          ref={ref}
          name={name}
          className={className}
        />
        {children}
      </label>
    );
  },
);

const MyButton = ({ type, id, value, form, children }) => {
  return (
    <label className={id} htmlFor={id}>
      <button value={value} type={type} form={form} id={id}>
        {children}
      </button>
    </label>
  );
};

const MyForm = () => {
  const { register, handleSubmit, errors } = useForm({ mode: 'onBlur' });
  const onSubmit = (data, event) => {
    event.target.reset(); // reset the form after submission
    console.log(data); // handle the data here
  };
  return (
    <>
      <form id="email-submit" onSubmit={handleSubmit(onSubmit)}>
        <MyInput
          placeholder="First Name"
          type="text"
          id="firstName"
          aria-invalid={errors.firstName ? 'true' : 'false'}
          aria-describedby="error-firstName-required error-firstName-maxLength"
          className={errors.firstName ? 'inputError' : ''}
          ref={register({
            required: (
              <p role="alert" id="error-firstName-required">
                First Name cannot be empty
              </p>
            ),
            minLength: {
              value: 2,
              message: (
                <p role="alert" id="error-firstName-maxLength">
                  First Name must be at least 2 characters
                </p>
              ),
            },
          })}
          name="firstName"
        >
          {errors.firstName && errors.firstName.message}
        </MyInput>

        <MyInput
          id="email"
          type="email"
          placeholder="Email Address"
          name="email"
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby="error-email-required error-email-pattern"
          className={errors.email ? 'inputError' : ''}
          ref={register({
            required: (
              <p role="alert" id="error-email-required">
                Email cannot be empty
              </p>
            ),
            pattern: {
              value: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
              message: (
                <p role="alert" id="error-email-pattern">
                  Email must be a valid email address
                </p>
              ),
            },
          })}
        >
          {errors.email && errors.email.message}
        </MyInput>

        <MyButton value="submit" type="submit" form="email-submit" id="my-form">
          Subscribe your email
        </MyButton>
      </form>
    </>
  );
};
export default function App() {
  return <MyForm />;
}
