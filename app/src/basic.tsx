import React from "react";
import useForm from 'react-hook-form';

const Basic: React.FC = () => {
  const { register, handleSubmit } = useForm();
  const onSubmit = () => {};
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="firstName" ref={register}/>
      <input name="lastName" ref={register}/>
    </form>
  );
};

export default Basic;
