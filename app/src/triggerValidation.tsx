import React from 'react';
import useForm from 'react-hook-form';

function TriggerValidation() {
  const { register, triggerValidation, errors } = useForm();
  return (
    <>
      <input name="test" ref={register({ required: true })} />
      <div id="testError">{errors.test && 'required'}</div>

      <input name="test1" ref={register({ required: true })} />
      <div id="test1Error">{errors.test1 && 'required'}</div>

      <input name="test2" ref={register({ required: true })} />
      <div id="test2Error">{errors.test2 && 'required'}</div>

      <button id="single" type="button" onClick={() => triggerValidation({ name: 'test' })}>
        trigger single
      </button>

      <button
        id="multiple"
        type="button"
        onClick={() =>
          triggerValidation([{ name: 'test1' }, { name: 'test2' }])
        }
      >
        trigger multiple
      </button>
    </>
  );
}

export default TriggerValidation;
