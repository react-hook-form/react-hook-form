import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

let renderCounter = 0;

const SetValueCustomRegister: React.FC = () => {
  const { register, setValue, handleSubmit, formState } = useForm<{
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
    register({ name: 'firstName' }, { required: true });
    register({ name: 'lastName' }, { required: true });
  }, [register]);

  renderCounter++;

  console.log(Object.keys(formState.touched));

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <button
        id="TriggerDirty"
        type="button"
        onClick={() => setValue('lastName', 'test')}
      >
        TriggerDirty
      </button>
      <button
        id="TriggerNothing"
        type="button"
        onClick={() => setValue('firstName', '')}
      >
        TriggerNothing
      </button>
      <button
        id="WithError"
        type="button"
        onClick={() => setValue('firstName', '', true)}
      >
        WithError
      </button>
      <button
        id="WithoutError"
        type="button"
        onClick={() => setValue('firstName', 'true', true)}
      >
        WithOutError
      </button>

      <div id="dirty">{formState.isDirty.toString()}</div>
      <div id="touched">
        {Object.keys(formState.touched).map((touch) => touch)}
      </div>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default SetValueCustomRegister;
