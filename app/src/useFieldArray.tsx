import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';

let renderCounter = 0;

const UseFieldArray: React.FC = (props: any) => {
  const { control, handleSubmit } = useForm<{
    data: object[];
  }>({
    ...(props.match.params.mode === 'default'
      ? {
          defaultValues: {
            data: [{ name: 'test' }, { name: 'test1' }, { name: 'test2' }],
          },
        }
      : {}),
  });
  const { fields, append, prepend, swap, move, insert, remove } = useFieldArray(
    {
      control,
      name: 'data',
    },
  );
  const onSubmit = () => {};

  renderCounter++;

  console.log(fields);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((data, index) => (
        <div key={data.id}>
          {index % 2 ? (
            <input
              className={`input${index}`}
              key={data.id}
              name={`data[${index}].name`}
              defaultValue={data.id}
              data-id={renderCounter}
            />
          ) : (
            <Controller
              as={<input />}
              control={control}
              name={`data[${index}].name`}
              defaultValue={data.id}
              data-id={renderCounter}
            />
          )}
          <button className={`delete${index}`}>delete</button>
        </div>
      ))}

      <button id="append" onClick={() => append({ test: 1 })}>
        append
      </button>

      <button id="prepend" onClick={() => prepend({ test: 1 })}>
        prepend
      </button>

      <button id="swap" onClick={() => swap(1, 3)}>
        swap
      </button>

      <button id="move" onClick={() => move(1, 3)}>
        move
      </button>

      <button id="insert" onClick={() => insert(2, { test: 1 })}>
        insert
      </button>

      <button id="remove" onClick={() => remove(1)}>
        remove
      </button>

      <button id="remove" onClick={() => remove()}>
        remove all
      </button>

      <div id="renderCounter">{renderCounter}</div>
    </form>
  );
};

export default UseFieldArray;
