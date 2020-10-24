import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

let renderCounter = 0;

const validationSchema = yup.object().shape({
  lastName: yup.string().min(10).required(),
  firstName: yup.string().min(10).required(),
  requiredField: yup.string().required(),
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
    requiredField: string;
  }>({
    resolver: yupResolver(validationSchema),
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
        onChange={(e) => {
          setValue('firstName', e.target.value, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }}
      />
      {errors.firstName && <p>firstName error</p>}

      <input
        name="lastName"
        placeholder="lastName"
        onChange={(e) => {
          setValue('lastName', e.target.value, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }}
      />
      {errors.lastName && <p>lastName error</p>}

      <input
        name="age"
        ref={register}
        onChange={(e) => {
          setValue('age', e.target.value, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }}
      />

      <input name="requiredField" placeholder="requiredField" ref={register} />
      {errors.requiredField && <p>RequiredField error</p>}

      <button
        type="button"
        id="setValue"
        onClick={() => {
          setValue('requiredField', 'test123456789', {
            shouldValidate: true,
            shouldDirty: true,
          });
        }}
      >
        firstName reset
      </button>

      <button id="submit">Submit</button>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default SetValueWithSchema;
