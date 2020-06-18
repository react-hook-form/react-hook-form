import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const SetError: React.FC = () => {
  const { register, setError, clearErrors, errors } = useForm<{
    firstName: string;
    lastName: string;
    age: string;
    test: string;
    test1: string;
    test2: string;
    username: string;
  }>();

  useEffect(() => {
    register({ name: 'firstName' });
    register({ name: 'lastName' });
    register({ name: 'age' });

    setError('firstName', { type: 'wrong' });
    setError('lastName', { type: 'wrong' });
    setError('age', { type: 'wrong' });
    setError('test', { type: 'test', message: 'testMessage' });
    [
      {
        type: 'required',
        name: 'test1',
        message: 'This is required.',
      },
      {
        type: 'minLength',
        name: 'test2',
        message: 'Minlength is 10',
      },
    ].forEach(({ name, type, message }) =>
      setError(name as any, { type, message }),
    );
    setError('username', {
      type: 'error',
      types: {
        required: 'This is required',
        minLength: 'This is minLength',
      },
    });
  }, [register, setError]);

  return (
    <div>
      <p id="error">
        {errors.test && errors.test.message}
        {errors.test1 && errors.test1.message}
        {errors.test2 && errors.test2.message}
        {errors.username &&
          errors.username.types &&
          errors.username.types.required}
        {errors.username &&
          errors.username.types &&
          errors.username.types.minLength}
      </p>

      <div id="errorContainer">
        {Object.values(errors).map((error: any, index) => (
          <div id={`error${index}`} key={index}>
            {index} {error && error.type}
          </div>
        ))}
      </div>

      <input
        id="clear1"
        value="clearError1"
        type="button"
        onClick={() => {
          clearErrors('firstName');
        }}
      />

      <input
        id="clear2"
        value="clearError2"
        type="button"
        onClick={() => {
          clearErrors('lastName');
        }}
      />

      <input
        id="clearArray"
        value="clearErrorArray"
        type="button"
        onClick={() => {
          clearErrors(['firstName', 'lastName']);
        }}
      />

      <input
        id="clear"
        value="clearError"
        type="button"
        onClick={() => {
          clearErrors();
        }}
      />
    </div>
  );
};

export default SetError;
