import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';

let renderCount = 0;

const UseFieldArray: React.FC = (props: any) => {
  const withoutFocus: boolean =
    props.match.params.mode === 'defaultAndWithoutFocus';
  const {
    control,
    handleSubmit,
    register,
    formState: { isDirty, touchedFields, isValid, dirtyFields, errors },
    reset,
  } = useForm<{ data: { name: string }[] }>({
    ...(props.match.params.mode === 'default' || withoutFocus
      ? {
          defaultValues: {
            data: [{ name: 'test' }, { name: 'test1' }, { name: 'test2' }],
          },
        }
      : {}),
    mode: props.match.params.mode === 'formState' ? 'onChange' : 'onSubmit',
  });
  const { fields, append, prepend, swap, move, insert, remove } = useFieldArray(
    {
      control,
      name: 'data',
    },
  );
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
                defaultValue={data.name}
                data-order={index}
                {...register(`data.${index}.name` as const, {
                  required: 'This is required',
                })}
              />
            ) : (
              <Controller
                render={({ field }) => (
                  <input id={`field${index}`} {...field} />
                )}
                control={control}
                rules={{
                  required: 'This is required',
                }}
                name={`data.${index}.name` as any}
                defaultValue={data.name}
                data-order={index}
              />
            )}
            {errors.data?.[index]?.name && (
              <p id={`error${index}`}>{errors.data[index]!.name!.message}</p>
            )}
            <button id={`delete${index}`} onClick={() => remove(index)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <button
        id="append"
        type="button"
        onClick={() =>
          append(
            { name: renderCount.toString() },
            {
              shouldFocus: !withoutFocus,
            },
          )
        }
      >
        append
      </button>

      <button
        id="prepend"
        type="button"
        onClick={() =>
          prepend(
            { name: renderCount.toString() },
            {
              shouldFocus: !withoutFocus,
            },
          )
        }
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
        onClick={() =>
          insert(
            1,
            { name: renderCount.toString() },
            {
              shouldFocus: !withoutFocus,
            },
          )
        }
      >
        insert
      </button>

      <button id="remove" type="button" onClick={() => remove(1)}>
        remove
      </button>

      <button id="removeAll" type="button" onClick={() => remove()}>
        remove all
      </button>

      <button
        id="reset"
        type="button"
        onClick={() => {
          reset({
            data: [{ name: 'test' }, { name: 'test1' }, { name: 'test2' }],
          });
        }}
      >
        reset
      </button>

      <button id="submit">Submit</button>

      <div id="renderCount">{renderCount}</div>
      <div id="result">{JSON.stringify(data)}</div>
      <div id="dirty">{isDirty ? 'yes' : 'no'}</div>
      <div id="isValid">{isValid ? 'yes' : 'no'}</div>
      <div id="dirtyFields">{JSON.stringify(dirtyFields)}</div>
      <div id="touched">{JSON.stringify(touchedFields.data)}</div>
    </form>
  );
};

export default UseFieldArray;
