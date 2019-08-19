import React from 'react';
import useForm from 'react-hook-form';
import { withRouter } from 'react-router';

const FormState: React.FC = (props: any) => {
  const { register, handleSubmit, formState } = useForm({
    mode: props.match.params.mode,
  });

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <input
        name="firstName"
        ref={register({ required: true })}
        placeholder="firstName"
      />
      <input
        name="lastName"
        ref={register({ required: true })}
        placeholder="lastName"
      />
      <div id="state">{JSON.stringify(formState)}</div>
      <button>Submit</button>
    </form>
  );
};

export default withRouter(FormState);
