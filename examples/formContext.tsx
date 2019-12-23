import React from 'react';
import ReactDOM from 'react-dom';
import { useForm, FormContext, useFormContext } from 'react-hook-form';

export default function App() {
  const methods = useForm();
  const { register, handleSubmit } = methods;
  return (
    <FormContext {...methods}>
      <form onSubmit={handleSubmit(data => console.log(data))}>
        <label>Test</label>
        <input name="test" ref={register({ required: true })} />
        <label>Nested Input</label>
        <Test />
        <input type="submit" />
      </form>
    </FormContext>
  );
}

function Test() {
  const data = useFormContext();
  return <input name="bill" ref={data.register} />;
}
