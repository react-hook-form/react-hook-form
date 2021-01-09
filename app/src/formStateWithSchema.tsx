import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

let renderCounter = 0;

const validationSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().max(5).required(),
  select: yup.string().required(),
  radio: yup.string().required(),
  checkbox: yup.string().required(),
});

const FormStateWithSchema: React.FC = (props: any) => {
  const {
    register,
    handleSubmit,
    formState: {
      dirty,
      isSubmitted,
      submitCount,
      touched,
      isDirty,
      isSubmitting,
      isSubmitSuccessful,
      isValid,
    },
    reset,
  } = useForm<{
    firstName: string;
    lastName: string;
    select: string;
    radio: string;
    checkbox: boolean;
  }>({
    resolver: yupResolver(validationSchema),
    mode: props.match.params.mode,
    defaultValues: {
      firstName: '',
      lastName: '',
      select: '',
      checkbox: false,
      radio: '',
    },
  });
  const onSubmit = () => {};

  renderCounter++;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName')} placeholder="firstName" />
      <input {...register('lastName')} placeholder="lastName" />
      <select {...register('select')}>
        <option value="">Select</option>
        <option value={1}>1</option>
        <option value={2}>1</option>
      </select>
      Radio1
      <input type="radio" {...register('radio')} value="1" />
      Radio2
      <input type="radio" {...register('radio')} value="2" />
      Radio3
      <input type="radio" {...register('radio')} value="3" />
      <input type="checkbox" {...register('checkbox')} />
      <button id="submit">Submit</button>
      <button type="button" onClick={() => reset()} id="resetForm">
        Reset
      </button>
      <div id="state">
        {JSON.stringify({
          isSubmitted,
          submitCount,
          isDirty,
          isSubmitting,
          isSubmitSuccessful,
          isValid,
          touched: Object.keys(touched),
          dirty: Object.keys(dirty),
        })}
      </div>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default FormStateWithSchema;
