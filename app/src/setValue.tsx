import React, { useEffect } from 'react';
import useForm from 'react-hook-form';

const SetValue: React.FC = () => {
  const { register, setValue, handleSubmit, errors } = useForm();

  useEffect(() => {
    register({ name: 'lastName' }, { required: true });
    register({ name: 'age' });

    setValue('firstName', 'wrong');
    setValue('age', '2');
    setValue('trigger', '', true);
    // eslint-disable-next-line
  }, []);

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <input name="firstName" ref={register} placeholder="firstName" />
      <input name="age" type="number" ref={register} placeholder="age" />

      <input
        name="lastName"
        placeholder="lastName"
        onChange={() => {
          setValue('lastName', 'test');
        }}
      />
      {errors.lastName && <p id="lastName">Last name error</p>}

      <input name="trigger" ref={register({ required: true })} placeholder="trigger" />
      {errors.trigger && <p id="trigger">Trigger error</p>}

      <button>Submit</button>
    </form>
  );
};

export default SetValue;
