import React, { useEffect } from 'react';
import { useForm, NestedValue } from 'react-hook-form';

let renderCounter = 0;

const SetValue: React.FC = () => {
  const { register, setValue, handleSubmit, errors } = useForm<{
    firstName: string;
    lastName: string;
    age: string;
    trigger: string;
    checkbox: boolean;
    checkboxArray: string[];
    radio: string;
    select: string;
    multiple: string[];
    array: string[];
    object: {
      firstName: string;
      lastName: string;
      middleName: string;
    };
    nestedValue: NestedValue<string[]>;
  }>();

  useEffect(() => {
    register({ name: 'lastName' }, { required: true });
    setValue('firstName', 'wrong');
    setValue('age', '2');
    setValue('trigger', '', { shouldValidate: true });
    setValue('checkbox', true);
    setValue('checkboxArray', ['2', '3']);
    setValue('radio', 'radio');
    setValue('select', 'a');
    setValue('multiple', ['a', 'b']);
    setValue('array', ['array[0]', 'array[1]', 'array[2]']);
    setValue('object', {
      firstName: 'firstName',
      lastName: 'lastName',
      middleName: 'middleName',
    });
    setValue('nestedValue', [], {
      shouldValidate: true,
    });
  }, [register, setValue]);

  renderCounter++;

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <input name="firstName" ref={register} placeholder="firstName" />
      <input name="array[0]" ref={register} placeholder="array[0]" />
      <input name="array[1]" ref={register} placeholder="array[1]" />
      <input name="array[2]" ref={register} placeholder="array[2]" />
      <input
        name="object.firstName"
        ref={register}
        placeholder="object.firstName"
      />
      <input
        name="object.lastName"
        ref={register}
        placeholder="object.lastName"
      />
      <input
        name="object.middleName"
        ref={register}
        placeholder="object.middleName"
      />
      <input name="age" type="number" ref={register} placeholder="age" />
      <input name="radio" value="radio" type="radio" ref={register} />
      <input name="checkbox" type="checkbox" ref={register} />
      <input name="checkboxArray" type="checkbox" value="1" ref={register} />
      <input name="checkboxArray" type="checkbox" value="2" ref={register} />
      <input name="checkboxArray" type="checkbox" value="3" ref={register} />
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

      <input
        name="nestedValue"
        ref={register({ required: 'required' })}
        placeholder="nestedValue"
      />
      {errors.nestedValue && (
        <p id="nestedValue">{errors.nestedValue.message}</p>
      )}

      <button
        type="button"
        id="setMultipleValues"
        onClick={() => {
          setValue('object', {
            firstName: 'firstName1',
            lastName: 'lastName1',
            middleName: 'middleName1',
          });
          setValue('array', ['array[0]1', 'array[1]1', 'array[2]1']);
          setValue('nestedValue', ['a', 'b']);
        }}
      >
        Set Multiple Values
      </button>

      <button id="submit">Submit</button>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default SetValue;
