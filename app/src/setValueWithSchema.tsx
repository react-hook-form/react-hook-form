import React, { useEffect } from 'react';
import useForm from 'react-hook-form';
import * as yup from 'yup';

let renderCounter = 0;

const validationSchema = yup.object().shape({
  lastName: yup.string().required(),
  firstName: yup.string().required(),
});

const SetValueWithSchema: React.FC = () => {
  const { register, setValue, handleSubmit, errors } = useForm<{
    firstName: string;
    lastName: string;
    age: string;
    checkbox: boolean;
    radio: string;
    select: string;
    multiple: string[];
  }>({
    validationSchema,
  });

  renderCounter++;

  useEffect(() => {
    register({ name: 'firstName' }, { required: true });
    register({ name: 'lastName' }, { required: true });
  }, [register]);

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <input
        name="firstName"
        placeholder="firstName"
        autoComplete="off"
        onChange={() => {
          setValue('firstName', 'test', true);
        }}
      />
      {errors.firstName && <p id="trigger">firstName error</p>}

      <input
        name="lastName"
        autoComplete="off"
        placeholder="lastName"
        onChange={() => {
          setValue('lastName', 'test', true);
        }}
      />
      {errors.lastName && <p id="lastName">Last name error</p>}

      <input name="age" ref={register} />

      <button>Submit</button>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default SetValueWithSchema;
