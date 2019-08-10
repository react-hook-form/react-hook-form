import React, { useEffect } from 'react';
import useForm from 'react-hook-form';

const SetError: React.FC = () => {
  const { register, setError, clearError, errors } = useForm();

  useEffect(() => {
    register({ name: 'firstName' });
    register({ name: 'lastName' });
    register({ name: 'age' });

    setError('firstName', 'wrong');
    setError('lastName', 'wrong');
    setError('age', 'wrong');
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <div id="errorContainer">
      {Object.values(errors).map((error, index) => (
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
