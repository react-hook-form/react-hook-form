import React from 'react';
import useForm from 'react-hook-form';
import * as yup from 'yup';

let renderCounter = 0;

const validationSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup
    .string()
    .max(5)
    .required(),
  select: yup.string().required(),
  radio: yup.string().required(),
  checkbox: yup.string().required(),
});

const FormStateWithSchema: React.FC = (props: any) => {
  const { register, handleSubmit, formState, reset } = useForm<{
    firstName: string;
    lastName: string;
    select: string;
    radio: string;
    checkbox: string;
  }>({
    validationSchema,
    mode: props.match.params.mode,
  });
  const onSubmit = () => {};

  renderCounter++;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="firstName" ref={register} placeholder="firstName" />
      <input name="lastName" ref={register} placeholder="lastName" />
      <select name="select" ref={register}>
        <option value="">Select</option>
        <option value={1}>1</option>
        <option value={2}>1</option>
      </select>
      Radio1
      <input type="radio" name="radio" ref={register} value="1" />
      Radio2
      <input type="radio" name="radio" ref={register} value="2" />
      Radio3
      <input type="radio" name="radio" ref={register} value="3" />
      <input type="checkbox" name="checkbox" ref={register} />
      <button>Submit</button>
      <button type="button" onClick={() => reset()} id="resetForm">
        Reset
      </button>
      <div id="state">{JSON.stringify(formState)}</div>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default FormStateWithSchema;
