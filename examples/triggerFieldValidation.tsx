import React from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-hook-form';

export default function App() {
  const { register, errors, triggerValidation } = useForm();

  console.log('errors', errors);

  return (
    <div className="App">
      <h1>validationField</h1>
      <label>First name: </label>
      <input name="firstName" ref={register({ required: true })} />

      <label>Last name: </label>
      <input name="lastName" ref={register({ required: true })} />

      <button
        type="button"
        onClick={async () => {
          console.log('firstName', await triggerValidation('firstName'));
          console.log(
            'firstName & lastName',
            await triggerValidation(['firstName', 'lastName']),
          );
          console.log(
            'firstName & lastName by regex',
            await triggerValidation(/.*Name/),
          );
        }}
      >
        Trigger
      </button>
    </div>
  );
}
