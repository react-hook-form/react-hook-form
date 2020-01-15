import React from 'react';
import { useForm } from 'react-hook-form';

const Transform: React.FC = () => {
  const { register, handleSubmit, watch, errors, reset } = useForm<{
    firstName: string;
    lastName: string;
  }>();
  const watchAll = watch();
  return (
    <form onSubmit={handleSubmit(() => {})}>
      <input
        name="firstName"
        ref={register({
          required: true,
          transform: value => value.charAt(0).toUpperCase() + value.slice(1),
          trim: true,
        })}
        placeholder="firstName"
      />
      {errors.firstName && <p>firstName error</p>}
      <input
        name="lastName"
        ref={register({
          required: true,
          transform: value => (value ?? '').toUpperCase(),
          trim: true,
        })}
        placeholder="lastName"
      />
      {errors.lastName && <p>lastName error</p>}
      <button id="submit">Submit</button>
      <button type="button" id="resetForm" onClick={() => reset()}>
        Reset
      </button>
      <div id="watchAll">{JSON.stringify(watchAll)}</div>
    </form>
  );
};

export default Transform;
