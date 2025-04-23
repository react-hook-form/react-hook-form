import React from 'react';
import ReactDOM from 'react-dom';
import { useForm } from '@bombillazo/rhf-plus';

import './styles.css';

const defaultValues = {
  firstName: 'bill',
  lastName: 'luo',
  email: 'email@hotmail.com',
};

function App() {
  const { register, handleSubmit } = useForm();
  // or you can set the defaultValues within useForm
  // const { register, handleSubmit } = useForm({
  //   defaultValues,
  // });
  const onSubmit = (data) => {
    alert(JSON.stringify(data));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="firstName">First Name</label>
      <input
        defaultValue={defaultValues.firstName}
        placeholder="bill"
        {...register('firstName')}
      />

      <label htmlFor="lastName">Last Name</label>
      <input
        defaultValue={defaultValues.lastName}
        placeholder="luo"
        {...register('lastName')}
      />

      <label htmlFor="email">Email</label>
      <input
        defaultValue={defaultValues.email}
        placeholder="email@hotmail.com"
        type="email"
        {...register('email')}
      />

      <input type="submit" />
    </form>
  );
}
