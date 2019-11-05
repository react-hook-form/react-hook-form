import React, { useEffect } from 'react';
import useForm from 'react-hook-form';

let renderCounter = 0;

const SetValue: React.FC = () => {
  const { register, setValue, handleSubmit, errors } = useForm<{
    firstName: string;
    lastName: string;
    age: string;
    trigger: string;
    checkbox: boolean;
    radio: string;
    select: string;
    multiple: string[];
  }>();

  useEffect(() => {
    register({ name: 'lastName' }, { required: true });
    setValue('firstName', 'wrong');
    setValue('age', '2');
    setValue('trigger', '', true);
    setValue('checkbox', true);
    setValue('radio', 'radio');
    setValue('select', 'a');
    setValue('multiple', ['a', 'b']);
  }, [register, setValue]);

  renderCounter++;

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <input name="firstName" ref={register} placeholder="firstName" />
      <input name="age" type="number" ref={register} placeholder="age" />
      <input name="radio" value="radio" type="radio" ref={register} />
      <input name="checkbox" type="checkbox" ref={register} />
      <select name="select" ref={register}>
        <option>Select</option>
        <option value="a">a</option>
        <option value="b">b</option>
      </select>
      <select multiple name="multiple" ref={register}>
        <option>Select</option>
        <option value="a">a</option>
        <option value="b">b</option>
      </select>

      <input
        name="lastName"
        placeholder="lastName"
        onChange={() => {
          setValue('lastName', 'test');
        }}
      />
      {errors.lastName && <p id="lastName">Last name error</p>}

      <input
        name="trigger"
        ref={register({ required: true })}
        placeholder="trigger"
      />
      {errors.trigger && <p id="trigger">Trigger error</p>}

      <button>Submit</button>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default SetValue;
