import * as React from 'react';
import { useFormState, useForm, Control } from 'react-hook-form';

let renderCounter = 0;

const SubForm = ({ control }: { control: Control }) => {
  const {
    isDirty,
    dirty,
    touched,
    isSubmitted,
    isSubmitSuccessful,
    submitCount,
    isValid,
  } = useFormState({
    control,
  });

  return (
    <p id="state">
      {JSON.stringify({
        isDirty,
        touched: Object.keys(touched),
        dirty: Object.keys(dirty),
        isSubmitted,
        isSubmitSuccessful,
        submitCount,
        isValid,
      })}
    </p>
  );
};

export const UseFormState: React.FC = () => {
  const { register, handleSubmit, control, reset } = useForm<{
    firstName: string;
    lastName: string;
    min: string;
    max: string;
    minDate: string;
    maxDate: string;
    minLength: string;
    minRequiredLength: string;
    selectNumber: string;
    pattern: string;
  }>({
    mode: 'onChange',
  });
  const onValid = () => {};

  renderCounter++;

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <input
        name="nestItem.nest1"
        placeholder="nest.nest1"
        ref={register({ required: true })}
      />
      <input
        name="arrayItem[0].test1"
        placeholder="arrayItem[0].test1"
        ref={register({ required: true })}
      />
      <input
        name="firstName"
        ref={register({ required: true })}
        placeholder="firstName"
      />
      <input
        name="lastName"
        ref={register({ required: true, maxLength: 5 })}
        placeholder="lastName"
      />
      <input
        type="number"
        name="min"
        ref={register({ min: 10 })}
        placeholder="min"
      />
      <input
        type="number"
        name="max"
        ref={register({ max: 20 })}
        placeholder="max"
      />
      <input
        type="date"
        name="minDate"
        ref={register({ min: '2019-08-01' })}
        placeholder="minDate"
      />
      <input
        type="date"
        name="maxDate"
        ref={register({ max: '2019-08-01' })}
        placeholder="maxDate"
      />
      <input
        name="minLength"
        ref={register({ minLength: 2 })}
        placeholder="minLength"
      />
      <input
        name="minRequiredLength"
        ref={register({ minLength: 2, required: true })}
        placeholder="minRequiredLength"
      />
      <select name="selectNumber" ref={register({ required: true })}>
        <option value="">Select</option>
        <option value={1}>1</option>
        <option value={2}>1</option>
      </select>
      <input
        name="pattern"
        ref={register({ pattern: /\d+/ })}
        placeholder="pattern"
      />
      <button id="submit">Submit</button>
      <button type="button" id="resetForm" onClick={() => reset()}>
        Reset
      </button>
      <div id="renderCount">{renderCounter}</div>
      <SubForm control={control} />
    </form>
  );
};
