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

      <select name="select" ref={register} defaultValue="test">
        <option value="test">test</option>
        <option value="test1">test1</option>
        <option value="test2">test3</option>
      </select>

      <input type="radio" name="radio" ref={register} />

      <input type="checkbox" name="checkbox" ref={register} />
      <input
        type="checkbox"
        name="checkbox-checked"
        defaultChecked
        ref={register}
      />
      <button>Submit</button>
    </form>
  );
};

export default withRouter(FormState);
