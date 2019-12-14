import React from 'react';
import { useForm } from 'react-hook-form';

let renderCounter = 0;

const Basic: React.FC = (props: any) => {
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
    checkboxArray: string[];
    multiple: string;
    validate: string;
  }>({
    mode: props.match.params.mode,
  });
  const onSubmit = () => {};

  renderCounter++;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        name="firstName"
        ref={register({ required: true })}
        placeholder="firstName"
      />
      {errors.firstName && <p>firstName error</p>}
      <input
        name="lastName"
        ref={register({ required: true, maxLength: 5 })}
        placeholder="lastName"
      />
      {errors.lastName && <p>lastName error</p>}
      <input
        type="number"
        name="min"
        ref={register({ min: 10 })}
        placeholder="min"
      />
      {errors.min && <p>min error</p>}
      <input
        type="number"
        name="max"
        ref={register({ max: 20 })}
        placeholder="max"
      />
      {errors.max && <p>max error</p>}
      <input
        type="date"
        name="minDate"
        ref={register({ min: '2019-08-01' })}
        placeholder="minDate"
      />
      {errors.minDate && <p>minDate error</p>}
      <input
        type="date"
        name="maxDate"
        ref={register({ max: '2019-08-01' })}
        placeholder="maxDate"
      />
      {errors.maxDate && <p>maxDate error</p>}
      <input
        name="minLength"
        ref={register({ minLength: 2 })}
        placeholder="minLength"
      />
      {errors.minLength && <p>minLength error</p>}
      <input
        name="minRequiredLength"
        ref={register({ minLength: 2, required: true })}
        placeholder="minRequiredLength"
      />
      {errors.minRequiredLength && <p>minRequiredLength error</p>}
      <select name="selectNumber" ref={register({ required: true })}>
        <option value="">Select</option>
        <option value={1}>1</option>
        <option value={2}>1</option>
      </select>
      {errors.selectNumber && <p>selectNumber error</p>}
      <input
        name="pattern"
        ref={register({ pattern: /\d+/ })}
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
        ref={register({ required: true })}
      />
      {errors.radio && <p>radio error</p>}
      <input
        type="checkbox"
        name="checkbox"
        ref={register({ required: true })}
      />
      {errors.checkbox && <p>checkbox error</p>}
      <input
        type="checkbox"
        name="checkboxArray"
        value="1"
        ref={register({ required: true })}
      />
      <input
        type="checkbox"
        name="checkboxArray"
        value="2"
        ref={register({ required: true })}
      />
      <input
        type="checkbox"
        name="checkboxArray"
        value="3"
        ref={register({ required: true })}
      />
      {errors.checkboxArray && <p>checkboxArray error</p>}
      <select name="multiple" multiple ref={register({ required: true })}>
        <option value="optionA">optionA</option>
        <option value="optionB">optionB</option>
      </select>
      {errors.multiple && <p>multiple error</p>}
      <input
        name="validate"
        type="validate"
        placeholder="validate"
        ref={register({
          validate: value => value === 'test',
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

export default Basic;
