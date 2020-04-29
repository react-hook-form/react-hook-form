import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const SetError: React.FC = () => {
  const { register, setError, clearError, errors } = useForm<{
    firstName: string;
    lastName: string;
    age: string;
    test: string;
    test1: string,
    test2: string,
    username: string,
  }>();

  useEffect(() => {
    register({ name: 'firstName' });
    register({ name: 'lastName' });
    register({ name: 'age' });

    setError('firstName', 'wrong');
    setError('lastName', 'wrong');
    setError('age', 'wrong');
    setError('test', 'test', 'testMessage');
    setError([
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
    ]);
    setError('username', {
      required: 'This is required',
      minLength: 'This is minLength',
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
          clearError('firstName');
        }}
      />

      <input
        id="clear2"
        value="clearError2"
        type="button"
        onClick={() => {
          clearError('lastName');
        }}
      />

      <input
        id="clearArray"
        value="clearErrorArray"
        type="button"
        onClick={() => {
          clearError(['firstName', 'lastName']);
        }}
      />

      <input
        id="clear"
        value="clearError"
        type="button"
        onClick={() => {
          clearError();
        }}
      />
    </div>
  );
};

export default SetError;
