import React from 'react';
import { FormProvider, useForm, useFormContext } from '@bombillazo/rhf-plus';

const ImperativeSubmitContext: React.FC = () => {
  const [result, setResult] = React.useState({});

  const form = useForm<{
    name: string;
  }>();

  return (
    <FormProvider {...form}>
      <form
        id={form.id}
        onSubmit={form.handleSubmit((data) => {
          setResult(data);
        })}
      >
        <h1>Imperative Submit with FormContext</h1>
        <input {...form.register('name')} placeholder="name" />
        <div id="result">{JSON.stringify(result)}</div>
      </form>
      <SubmitButton />
    </FormProvider>
  );
};

const SubmitButton: React.FC = () => {
  const form = useFormContext();

  return (
    <button
      onClick={() => {
        form.submit();
      }}
    >
      Submit
    </button>
  );
};

export default ImperativeSubmitContext;
