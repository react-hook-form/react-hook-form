import React from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-hook-form';

function App() {
  const { register, handleSubmit } = useForm({
    nativeValidation: true,
  });
  const onSubmit = async data => {
    alert(JSON.stringify(data));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>First name</label>
      <input
        name="firstName"
        ref={register({ required: 'Please enter your first name.' })}
      />
      <label>Last name</label>
      <input
        name="lastName"
        ref={register({ required: 'Please enter your last name.' })}
      />
      <input type="submit" />
    </form>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
