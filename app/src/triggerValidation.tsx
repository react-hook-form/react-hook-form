import React from 'react';
import { useForm } from 'react-hook-form';

let renderCounter = 0;

function TriggerValidation() {
  const { register, triggerValidation, errors } = useForm<{
    test: string;
    test1: string;
    test2: string;
    test3: string;
    test4: string;
  }>();

  renderCounter++;

  return (
    <>
      <input name="test" ref={register({ required: true })} />
      <div id="testError">{errors.test && 'required'}</div>

      <input name="test1" ref={register({ required: true })} />
      <div id="test1Error">{errors.test1 && 'required'}</div>

      <input name="test2" ref={register({ required: true })} />
      <div id="test2Error">{errors.test2 && 'required'}</div>

      <input name="test3" ref={register({ required: true })} />
      <div id="test3Error">{errors.test3 && 'required'}</div>

      <input name="test4" ref={register({ required: true })} />
      <div id="test4Error">{errors.test4 && 'required'}</div>

      <button
        id="single"
        type="button"
        onClick={() => triggerValidation('test')}
      >
        trigger single
      </button>

      <button
        id="multiple"
        type="button"
        onClick={() => triggerValidation(['test1', 'test2'])}
      >
        trigger multiple
      </button>

      <button
        id="regex"
        type="button"
        onClick={() => triggerValidation(/test[3|4]/)}
      >
        trigger multiple by regex
      </button>

      <div id="renderCount">{renderCounter}</div>
    </>
  );
}

export default TriggerValidation;
