import React from 'react';
import useForm from 'react-hook-form';

const Basic: React.FC = () => {
  const { register, handleSubmit, errors } = useForm();
  const onSubmit = () => {};

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="firstName" ref={register({ required: true })} />
      {errors.firstName && <p className="firstName">firstName error</p>}
      <input name="lastName" ref={register({ required: true })} />
      {errors.lastName && <p className="lastName">lastName error</p>}

      <button>Submit</button>
    </form>
  );
};

export default Basic;
