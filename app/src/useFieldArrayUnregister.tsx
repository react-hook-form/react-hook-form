import React from 'react';
import {
  useForm,
  useWatch,
  useFieldArray,
  Controller,
  Control,
  UseFormReturn,
} from 'react-hook-form';

let renderCount = 0;

type FormInputs = {
  data: { name: string; conditional: string }[];
};

const ConditionField = <T extends any[]>({
  control,
  index,
  fields,
  unregister,
}: {
  control: Control<FormInputs>;
  unregister: UseFormReturn<FormInputs>['unregister'];
  index: number;
  fields: T;
}) => {
  const output = useWatch<FormInputs>({
    name: 'data',
    control,
    defaultValue: fields,
  });

  React.useEffect(() => {
    return () => {
      unregister(`data.${index}.conditional` as const, {
        keepDirty: true,
        keepTouched: true,
      });
    };
  }, [unregister, index]);

  return output[index]?.name === 'bill' ? (
    <input
      {...control.register(`data.${index}.conditional`)}
      defaultValue={fields[index].conditional}
    />
  ) : null;
};

const UseFieldArrayUnregister: React.FC = () => {
  const {
    control,
    handleSubmit,
    register,
    unregister,
    setValue,
    getValues,
    formState: { isDirty, touchedFields, dirtyFields, errors },
  } = useForm<FormInputs>({
    defaultValues: {
      data: [{ name: 'test' }, { name: 'test1' }, { name: 'test2' }],
    },
    mode: 'onSubmit',
  });
  const {
    fields,
    append,
    prepend,
    swap,
    move,
    insert,
    remove,
  } = useFieldArray<FormInputs>({
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
                defaultValue={data.name}
                data-order={index}
                {...register(`data.${index}.name`, {
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
                name={`data.${index}.name`}
                defaultValue={data.name}
                data-order={index}
              />
            )}
            {errors.data?.[index]?.name && (
              <p id={`error${index}`}>{errors.data[index]!.name!.message}</p>
            )}

            <ConditionField
              control={control}
              index={index}
              fields={fields}
              unregister={unregister}
            />

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
      <div id="touched">{JSON.stringify(touchedFields.data)}</div>
    </form>
  );
};

export default UseFieldArrayUnregister;
