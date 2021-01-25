import React from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-hook-form';

export default function App() {
  const { register, handleSubmit, formState } = useForm({
    mode: 'onChange',
  });
  const onSubmit = (data) => {
    alert(JSON.stringify(data));
  };

  console.log(formState);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>First name</label>
        <input type="text" {...register('FirstName')} />
      </div>
      <div>
        <label>Last name</label>
        <input type="text" {...register('LastName')} />
      </div>
      <div>
        <label>Email</label>
        <input type="text" {...register('Email')} />
      </div>
      <div>
        <label>Mobile number</label>
        <input type="tel" {...register('MobileNumber')} />
      </div>
      <div>
        <label>Title</label>
        <select {...register('Title')}>
          <option value="Mr">Mr</option>
          <option value="Mrs">Mrs</option>
          <option value="Miss">Miss</option>
          <option value="Dr">Dr</option>
        </select>
      </div>

      <div>
        <label>Are you a developer?</label>
        <input type="radio" value="Yes" {...register('developer')} />
        <input type="radio" value="No" {...register('developer')} />
      </div>

      <pre>{JSON.stringify(formState, null, 2)}</pre>

      <input type="submit" />
    </form>
  );
}
