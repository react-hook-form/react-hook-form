import React, { useEffect } from 'react';
import { useForm, NestedValue } from 'react-hook-form';

let renderCounter = 0;

const SetValue: React.FC = () => {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    firstName: string;
    lastName: string;
    age: string;
    trigger: string;
    checkbox: boolean;
    checkboxArray: string;
    radio: string;
    select: string;
    multiple: NestedValue<string[]>;
    array: string[];
    object: {
      firstName: string;
      lastName: string;
      middleName: string;
    };
    nestedValue: NestedValue<string[]>;
  }>();

  useEffect(() => {
    register('lastName', { required: true });
    setValue('firstName', 'wrong', { shouldDirty: true });
    setValue('age', '2', { shouldDirty: true });
    setValue('trigger', '', { shouldDirty: true, shouldValidate: true });
    setValue('checkbox', true, { shouldDirty: true });
    setValue('checkboxArray', ['2', '3'], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('radio', 'radio', { shouldDirty: true });
    setValue('select', 'a', { shouldDirty: true });
    setValue('multiple', ['a', 'b'], { shouldDirty: true });
    setValue('array', ['array.0', 'array.1', 'array.2'], {
      shouldDirty: true,
    });
    setValue(
      'object',
      {
        firstName: 'firstName',
        lastName: 'lastName',
        middleName: 'middleName',
      },
      { shouldDirty: true },
    );
    setValue('nestedValue', [], {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [register, setValue]);

  renderCounter++;

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <input
        name="firstName"
        {...register('firstName')}
        placeholder="firstName"
      />
      <input {...register('array.0')} placeholder="array[0]" />
      <input {...register('array.1')} placeholder="array[1]" />
      <input {...register('array.2')} placeholder="array[2]" />
      <input
        name="object.firstName"
        {...register('object.firstName')}
        placeholder="object.firstName"
      />
      <input
        name="object.lastName"
        {...register('object.lastName')}
        placeholder="object.lastName"
      />
      <input
        name="object.middleName"
        {...register('object.middleName')}
        placeholder="object.middleName"
      />
      <input name="age" type="number" {...register('age')} placeholder="age" />
      <input name="radio" value="radio" type="radio" {...register('radio')} />
      <input name="checkbox" type="checkbox" {...register('checkbox')} />
      <input
        name="checkboxArray"
        type="checkbox"
        value="1"
        {...register('checkboxArray')}
      />
      <input
        name="checkboxArray"
        type="checkbox"
        value="2"
        {...register('checkboxArray')}
      />
      <input
        name="checkboxArray"
        type="checkbox"
        value="3"
        {...register('checkboxArray')}
      />
      <select name="select" {...register('select')}>
        <option>Select</option>
        <option value="a">a</option>
        <option value="b">b</option>
      </select>
      <select multiple name="multiple" {...register('multiple')}>
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
        {...register('trigger', { required: true })}
        placeholder="trigger"
      />
      {errors.trigger && <p id="trigger">Trigger error</p>}

      <input
        name="nestedValue"
        {...register('nestedValue', { required: 'required' })}
        placeholder="nestedValue"
      />
      {errors.nestedValue && (
        <p id="nestedValue">{errors.nestedValue.message}</p>
      )}

      <button
        type="button"
        id="setMultipleValues"
        onClick={() => {
          setValue(
            'object',
            {
              firstName: 'firstName1',
              lastName: 'lastName1',
              middleName: 'middleName1',
            },
            { shouldDirty: true },
          );
          setValue('array', ['array[0]1', 'array[1]1', 'array[2]1'], {
            shouldDirty: true,
          });
          setValue('nestedValue', ['a', 'b'], { shouldDirty: true });
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
