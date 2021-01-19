import React from 'react';
import { useForm } from 'react-hook-form';
import { withRouter } from 'react-router';
import { ValidationMode } from '../../src/types';

let renderCounter = 0;

const FormState = (props: {
  match: {
    params: {
      mode: keyof ValidationMode;
    };
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: {
      dirtyFields,
      isSubmitted,
      submitCount,
      touchedFields,
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
    ['checkbox-checked']: boolean;
  }>({
    mode: props.match.params.mode,
    defaultValues: {
      firstName: '',
      lastName: '',
      select: '',
      checkbox: false,
      radio: '',
      'checkbox-checked': true,
    },
  });

  renderCounter++;

  return (
    <form onSubmit={handleSubmit((d) => {
      console.log(d)
    })}>
      <input
        {...register('firstName', { required: true })}
        placeholder="firstName"
      />
      <input
        {...register('lastName', { required: true })}
        placeholder="lastName"
      />
      <div id="state">
        {JSON.stringify({
          isSubmitted,
          submitCount,
          isDirty,
          isSubmitting,
          isSubmitSuccessful,
          isValid,
          touched: Object.keys(touchedFields),
          dirty: Object.keys(dirtyFields),
        })}
      </div>
      <select {...register('select')} defaultValue="test">
        <option value="">Select</option>
        <option value="test">test</option>
        <option value="test1">test1</option>
        <option value="test2">test3</option>
      </select>

      <input type="radio" {...register('radio')} />

      <input type="checkbox" {...register('checkbox')} />
      <input type="checkbox" {...register('checkbox-checked')} />
      <button id="submit">Submit</button>
      <button type="button" onClick={() => reset()} id="resetForm">
        Reset
      </button>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default withRouter(FormState);
