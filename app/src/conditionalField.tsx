import React from 'react';
import useForm from 'react-hook-form';

let renderCounter = 0;

const ConditionalField: React.FC = () => {
  const { register, handleSubmit, watch, formState } = useForm<{
    selectNumber: string;
    firstName: string;
    lastName: string;
    min: string;
    max: string;
    notRequired: string;
  }>({
    mode: 'onChange',
  });
  const [result, setResult] = React.useState({});

  const selectNumber = watch('selectNumber');

  renderCounter++;

  return (
    <form
      onSubmit={handleSubmit(data => {
        setResult(data);
      })}
    >
      <select name="selectNumber" ref={register({ required: true })}>
        <option value="">Select</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>

      {selectNumber === '1' && (
        <>
          <input
            name="firstName"
            ref={register({ required: true })}
            placeholder="firstName"
          />
          <input
            name="lastName"
            ref={register({ required: true })}
            placeholder="lastName"
          />
        </>
      )}

      {selectNumber === '2' && (
        <>
          <input
            type="number"
            name="min"
            ref={register({ required: true, min: 10 })}
            placeholder="min"
          />
          <input
            type="number"
            name="max"
            ref={register({ required: true, max: 20 })}
            placeholder="max"
          />
        </>
      )}

      {selectNumber === '3' && (
        <>
          <input name="notRequired" ref={register} placeholder="notRequired" />
        </>
      )}

      <button id="submit">Submit</button>
      <div id="state">{JSON.stringify(formState)}</div>
      <div id="result">{JSON.stringify(result)}</div>
      <div id="result">{typeof selectNumber}</div>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default ConditionalField;
