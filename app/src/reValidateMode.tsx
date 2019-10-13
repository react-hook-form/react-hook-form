import React from 'react';
import useForm from 'react-hook-form';

let renderCounter = 0;

const Basic: React.FC = (props: any) => {
  const { register, handleSubmit, errors } = useForm({
    mode: props.match.params.mode,
    reValidateMode: props.match.params.reValidateMode,
  });
  const onSubmit = () => {};

  renderCounter++;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        name="firstName"
        ref={register({ required: true })}
        placeholder="firstName"
      />
      {errors.firstName && <p>firstName error</p>}
      <input
        name="lastName"
        ref={register({ required: true, maxLength: 5 })}
        placeholder="lastName"
      />
      {errors.lastName && <p>lastName error</p>}
      <button id="submit">Submit</button>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default Basic;
