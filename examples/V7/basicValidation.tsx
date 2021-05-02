import React from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-hook-form';

export default function App() {
  const { register, formState: { errors }, handleSubmit } = useForm();
  const onSubmit = (data) => {
    alert(JSON.stringify(data));
  };
  console.log(errors);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>First name</label>
        <input
          type="text"
          {...register('firstName', { required: true, maxLength: 80 })}
        />
      </div>
      <div>
        <label>Last name</label>
        <input
          type="text"
          {...register('lastName', { required: true, maxLength: 100 })}
        />
      </div>
      <div>
        <label>Email</label>
        <input
          type="text"
          {...register('email', {
            required: true,
            pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          })}
        />
      </div>
      <div>
        <label>Mobile number</label>
        <input
          type="tel"
          {...register('mobileNumber', {
            required: true,
            maxLength: 11,
            minLength: 8,
          })}
        />
      </div>
      <div>
        <label>Title</label>
        <select {...register('title', { required: true })}>
          <option value="Mr">Mr</option>
          <option value="Mrs">Mrs</option>
          <option value="Miss">Miss</option>
          <option value="Dr">Dr</option>
        </select>
      </div>

      <div>
        <label>Are you a developer?</label>
        <input
          type="radio"
          value="Yes"
          {...register('developer', { required: true })}
        />
        <input
          type="radio"
          value="No"
          {...register('developer', { required: true })}
        />
      </div>

      <div>
        <input type="text" {...register('asdasd')} />
      </div>

      <input type="submit" />
    </form>
  );
}
