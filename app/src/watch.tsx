import React from 'react';
import useForm from 'react-hook-form';

const Basic: React.FC = () => {
  const { register, handleSubmit, watch } = useForm();
  const onSubmit = () => {};
  const test = watch('test');
  console.log(test);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="firstName" ref={register} />
      <input name="lastName" ref={register} />

      <input name="test[0]" ref={register} />
      <input name="test[1]" ref={register} />

      <button>Submit</button>
    </form>
  );
};

export default Basic;
