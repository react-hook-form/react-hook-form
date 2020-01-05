import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

let renderCounter = 0;

const UseFieldArray: React.FC = (props: any) => {
  const { control, handleSubmit } = useForm<{
    data: string[];
  }>();
  const { fields, append, prepend } = useFieldArray({
    control,
    name: 'data',
  });
  const onSubmit = () => {};

  renderCounter++;

  console.log(fields);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((data, index) => (
        <div key={data.id}>
          <input className={`input${index}`} key={data.id} defaultValue={data.id} />
          <button className={`delete${index}`}>delete</button>
        </div>
      ))}

      <button id="append" onClick={() => append({ test: 1 })}>
        append
      </button>

      <button id="append" onClick={() => prepend({ test: 1 })}>
        prepend
      </button>

      <div id="renderCounter">{renderCounter}</div>
    </form>
  );
};

export default UseFieldArray;
