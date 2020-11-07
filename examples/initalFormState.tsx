import React from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-hook-form';

export default function App() {
  const { register, handleSubmit } = useForm();
  const onSubmit = data => {
    alert(JSON.stringify(data));
  };
  const initialValues = {
    firstName: 'bill',
    lastName: 'luo',
    email: 'bluebill1049@hotmail.com',
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            defaultValue={initialValues.firstName}
            name="firstName"
            placeholder="bill"
            ref={register}
          />
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input
            defaultValue={initialValues.lastName}
            name="lastName"
            placeholder="luo"
            ref={register}
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            defaultValue={initialValues.email}
            name="email"
            placeholder="bluebill1049@hotmail.com"
            type="email"
            ref={register}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
