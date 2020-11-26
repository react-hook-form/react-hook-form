import React from 'react';
import ReactDOM from 'react-dom';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';

export default function App() {
  const formCtx = useForm();
  const { register, handleSubmit } = formCtx;
  return (
    <FormProvider {...formCtx}>
      <form onSubmit={handleSubmit((data) => console.log(data))}>
        <label>Test</label>
        <input name="test" ref={register({ required: true })} />
        <label>Nested Input</label>
        <Test />
        <input type="submit" />
      </form>
    </FormProvider>
  );
}

function Test() {
  const ctx = useFormContext();
  return <input name="bill" ref={ctx.register} />;
}
