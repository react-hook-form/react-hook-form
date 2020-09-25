import React from 'react';
import {
  useForm,
  useWatch,
  useFieldArray,
  Controller,
  Control,
} from 'react-hook-form';

let renderCount = 0;

const ConditionField = <T extends any[]>({
  control,
  index,
  fields,
}: {
  control: Control;
  index: number;
  fields: T;
}) => {
  const output = useWatch<any>({
    name: 'data',
    control,
    defaultValue: fields,
  });

  return output[index]?.name === 'bill' ? (
    <input ref={control.register()} name={`data[${index}].conditional`} defaultValue={output[index].conditional} />
  ) : null;
};

const UseFieldArrayUnregister: React.FC = () => {
  const {
    control,
    handleSubmit,
    register,
    setValue,
    getValues,
    formState: { isDirty, touched, dirtyFields },
    errors,
  } = useForm<{
    data: { name: string }[];
  }>({
    defaultValues: {
      data: [{ name: 'test' }, { name: 'test1' }, { name: 'test2' }],
    },
    mode: 'onSubmit',
    shouldUnregister: false,
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
  const updateFieldArray = () => {
    setValue('data', [...getValues().data, { name: 'test' }]);
  };

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
                render={(props) => <input id={`field${index}`} {...props} />}
                control={control}
                rules={{
                  required: 'This is required',
                }}
                name={`data[${index}].name`}
                defaultValue={data.name}
                data-order={index}
              />
            )}
            {errors.data?.[index]?.name && (
              <p id={`error${index}`}>{errors.data[index]!.name!.message}</p>
            )}

            <ConditionField control={control} index={index} fields={fields} />

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

      <button id="move" onClick={() => move(4, 2)} type="button">
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

      <button type={'button'} onClick={updateFieldArray}>
        SetValue
      </button>

      <div id="renderCount">{renderCount}</div>
      <div id="result">{JSON.stringify(data)}</div>
      <div id="dirty">{isDirty ? 'yes' : 'no'}</div>
      <div id="dirtyFields">{JSON.stringify(dirtyFields)}</div>
      <div id="touched">{JSON.stringify(touched.data)}</div>
    </form>
  );
};

export default UseFieldArrayUnregister;
