import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';

let renderCount = 0;

const UseFieldArray: React.FC = (props: any) => {
  const { control, handleSubmit, register } = useForm<{
    data: { name: string }[];
  }>({
    ...(props.match.params.mode === 'default'
      ? {
          defaultValues: {
            data: [{ name: 'test' }, { name: 'test1' }, { name: 'test2' }],
          },
        }
      : {}),
  });
  const {
    fields,
    append,
    prepend,
    swap,
    move,
    insert,
    remove,
  } = useFieldArray<{ name: string }>({
    control,
    name: 'data',
  });
  const [data, setData] = React.useState([]);
  const onSubmit = (data: any) => {
    setData(data);
  };

  renderCount++;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ul>
        {fields.map((data, index) => (
          <li key={data.id}>
            {index % 2 ? (
              <input
                key={data.id}
                name={`data[${index}].name`}
                defaultValue={data.name}
                data-order={index}
                ref={register}
              />
            ) : (
              <Controller
                as={<input />}
                control={control}
                name={`data[${index}].name`}
                defaultValue={data.name}
                data-order={index}
              />
            )}
            <button className={`delete${index}`}>delete</button>
          </li>
        ))}
      </ul>

      <button
        id="append"
        type="button"
        onClick={() => append({ name: renderCount.toString() })}
      >
        append
      </button>

      <button
        id="prepend"
        type="button"
        onClick={() => prepend({ name: renderCount.toString() })}
      >
        prepend
      </button>

      <button id="swap" onClick={() => swap(1, 2)} type="button">
        swap
      </button>

      <button id="move" onClick={() => move(2, 0)} type="button">
        move
      </button>

      <button
        id="insert"
        type="button"
        onClick={() => insert(1, { name: renderCount.toString() })}
      >
        insert
      </button>

      <button id="remove" type="button" onClick={() => remove(1)}>
        remove
      </button>

      <button id="removeAll" type="button" onClick={() => remove()}>
        remove all
      </button>

      <button id="submit">Submit</button>

      <div id="renderCount">{renderCount}</div>
      <div id="result">{JSON.stringify(data)}</div>
    </form>
  );
};

export default UseFieldArray;
