import React from 'react';
import {
  useForm,
  useFieldArray,
  Controller,
  ErrorMessage,
} from 'react-hook-form';

let renderCount = 0;

const UseFieldArray: React.FC = (props: any) => {
  const {
    control,
    handleSubmit,
    register,
    formState: { dirty, touched, isValid, dirtyFields },
    reset,
    errors,
  } = useForm<{
    data: { name: string }[];
  }>({
    ...(props.match.params.mode === 'default'
      ? {
          defaultValues: {
            data: [{ name: 'test' }, { name: 'test1' }, { name: 'test2' }],
          },
        }
      : {}),
    mode: props.match.params.mode === 'formState' ? 'onChange' : 'onSubmit',
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

  React.useEffect(() => {
    setTimeout(() => {
      if (props.match.params.mode === 'asyncReset') {
        reset({
          data: [{ name: 'test' }, { name: 'test1' }, { name: 'test2' }],
        });
      }
    }, 10);
  }, [reset, props.match.params.mode]);

  renderCount++;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ul>
        {fields.map((data, index) => (
          <li key={data.id}>
            {index % 2 ? (
              <input
                id={`field${index}`}
                name={`data[${index}].name`}
                defaultValue={data.name}
                data-order={index}
                ref={register({ required: 'This is required' })}
              />
            ) : (
              <Controller
                as={<input id={`field${index}`} />}
                control={control}
                rules={{
                  required: 'This is required',
                }}
                name={`data[${index}].name`}
                defaultValue={data.name}
                data-order={index}
              />
            )}
            <ErrorMessage errors={errors} name={`data[${index}].name`}>
              {({ message }) => <p id={`error${index}`}>{message}</p>}
            </ErrorMessage>
            <button id={`delete${index}`} onClick={() => remove(index)}>
              Delete
            </button>
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
      <div id="dirty">{dirty ? 'yes' : 'no'}</div>
      <div id="isValid">{isValid ? 'yes' : 'no'}</div>
      <div id="dirtyFields">{JSON.stringify([...dirtyFields])}</div>
      <div id="touched">{JSON.stringify(touched.data)}</div>
    </form>
  );
};

export default UseFieldArray;
