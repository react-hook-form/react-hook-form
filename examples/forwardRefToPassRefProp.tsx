import React from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-hook-form';

const MyInput = React.forwardRef(
  ({ name, children }, ref) => {
    return (
      <input ref={ref} name={name} />
    );
  },
);

export default function App() {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data, event) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MyInput ref={register} name="firstName" />

      <button>Submit</button>
    </form>
  );
}
