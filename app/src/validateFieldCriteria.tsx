import React from 'react';
import useForm from 'react-hook-form';

let renderCounter = 0;

const ValidateFieldCriteria: React.FC = (props: any) => {
  const { register, handleSubmit, errors, reset } = useForm<{
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
    radio: string;
    checkbox: string;
    multiple: string;
    validate: string;
  }>({
    validateAllFieldCriteria: props.match.params.mode,
  });
  const onSubmit = () => {};

  renderCounter++;

  console.log(errors);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        name="firstName"
        ref={register({ required: true, minLength: 4 })}
        placeholder="firstName"
      />
      {errors.firstName &&
        errors.firstName.types &&
        errors.firstName.types.required && <p>firstName required</p>}
      {errors.firstName &&
        errors.firstName.types &&
        errors.firstName.types.minLength && <p>firstName minLength</p>}
      <input
        type="number"
        name="min"
        ref={register({ required: true, min: 10 })}
        placeholder="min"
      />
      {errors.min && errors.min.types && errors.min.types.required && (
        <p>min required</p>
      )}
      {errors.min && errors.min.types && errors.min.types.min && (
        <p>min not meet</p>
      )}
      <input
        type="number"
        name="max"
        ref={register({ required: true, max: 20 })}
        placeholder="max"
      />
      {errors.max && <p>max error</p>}
      <input
        type="date"
        name="minDate"
        ref={register({ required: true, min: '2019-08-01' })}
        placeholder="minDate"
      />
      {errors.minDate && <p>minDate error</p>}
      <input
        type="date"
        name="maxDate"
        ref={register({ required: true, max: '2019-08-01' })}
        placeholder="maxDate"
      />
      {errors.maxDate && <p>maxDate error</p>}
      <input
        name="minLength"
        ref={register({ required: true, minLength: 2 })}
        placeholder="minLength"
      />
      {errors.minLength && <p>minLength error</p>}
      <input
        name="minRequiredLength"
        ref={register({ minLength: 2, required: true })}
        placeholder="minRequiredLength"
      />
      {errors.minRequiredLength && <p>minRequiredLength error</p>}
      <select name="selectNumber" ref={register({ required: true, min: 0 })}>
        <option value="">Select</option>
        <option value={1}>1</option>
        <option value={2}>1</option>
      </select>
      {errors.selectNumber && <p>selectNumber error</p>}
      <input
        name="pattern"
        ref={register({ pattern: /\d+/, required: true, minLength: 3 })}
        placeholder="pattern"
      />
      {errors.pattern && <p>pattern error</p>}
      Radio1
      <input type="radio" name="radio" ref={register} value="1" />
      Radio2
      <input type="radio" name="radio" value="2" ref={register} />
      Radio3
      <input
        type="radio"
        name="radio"
        value="3"
        ref={register({ required: true, min: 1 })}
      />
      {errors.radio && <p>radio error</p>}
      <select
        name="multiple"
        multiple
        ref={register({
          required: true,
          validate: value => value === 'optionB',
        })}
      >
        <option value="optionA">optionA</option>
        <option value="optionB">optionB</option>
      </select>
      {errors.multiple && <p>multiple error</p>}
      <input
        name="validate"
        type="validate"
        placeholder="validate"
        ref={register({
          validate: {
            test: value => value === 'test',
            test1: value => value === 'test',
            test3: value => value === 'test',
          },
        })}
      />
      {errors.validate && <p>validate error</p>}
      <button id="submit">Submit</button>
      <button type="button" id="resetForm" onClick={() => reset()}>
        Reset
      </button>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default ValidateFieldCriteria;
