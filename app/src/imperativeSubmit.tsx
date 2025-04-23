import React from 'react';
import { useForm } from 'rhf-plus';

const ImperativeSubmit: React.FC = () => {
  const [result, setResult] = React.useState({});
  const [formId, setFormId] = React.useState<undefined | string>(undefined);

  const { register, handleSubmit, id, submit } = useForm<{
    name: string;
  }>({ id: formId });

  return (
    <>
      <form
        id={id}
        onSubmit={handleSubmit((data) => {
          setResult(data);
        })}
      >
        <h1>Imperative Submit</h1>
        <div id="form-id">Form ID: {id}</div>
        <input
          name="formId"
          onChange={(e) => {
            setFormId(e.target.value);
          }}
          placeholder="form id"
        />
        <input {...register('name')} placeholder="name" />
      </form>
      <button
        onClick={() => {
          submit();
        }}
      >
        Submit
      </button>
      <div id="result">{JSON.stringify(result)}</div>
    </>
  );
};

export default ImperativeSubmit;
