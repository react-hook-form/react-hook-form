import React from 'react';
import { createFormControl, useForm } from 'rhf-plus';

const fc = createFormControl<{
  name: string;
}>();

const ImperativeSubmitControl: React.FC = () => {
  const [result, setResult] = React.useState({});

  useForm({ formControl: fc.formControl });

  return (
    <>
      <form
        id={fc.id}
        onSubmit={fc.handleSubmit((data) => {
          setResult(data);
        })}
      >
        <h1>Imperative Submit with createFormControl</h1>
        <input {...fc.register('name')} placeholder="name" />
        <div id="result">{JSON.stringify(result)}</div>
      </form>
      <SubmitButton />
    </>
  );
};

const SubmitButton: React.FC = () => {
  return (
    <button
      onClick={() => {
        fc.submit();
      }}
    >
      Submit
    </button>
  );
};

export default ImperativeSubmitControl;
