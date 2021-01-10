import * as React from 'react';
import { Controller, useFieldArray, useForm, Control } from 'react-hook-form';

type FormValues = {
  test: {
    firstName: string;
    lastName: string;
    keyValue: { name: string }[];
  }[];
};

function NestedArray({
  control,
  name,
}: {
  control: Control<FormValues>;
  name: string;
}) {
  // @ts-ignore
  const { fields, append, prepend, swap, move, remove, insert } = useFieldArray(
    {
      // @ts-ignore
      name,
      control,
    },
  );

  return (
    <div>
      <ul>
        {fields.map((item, index) => (
          <Controller
            key={item.id}
            render={({ field }) => <input {...field} aria-label={'name'} />}
            name={`${name}.${index}.name` as any}
            control={control}
            // @ts-ignore
            defaultValue={item.name}
          />
        ))}
      </ul>

      <button
        id="append"
        type="button"
        // @ts-ignore
        onClick={() => append({ name: 'append' })}
      >
        append
      </button>

      <button
        id="prepend"
        type="button"
        // @ts-ignore
        onClick={() => prepend({ name: 'prepend' })}
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
          // @ts-ignore
          insert(1, { name: 'insert' })
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
    </div>
  );
}

export default () => {
  const { register, control, reset } = useForm<FormValues>({
    defaultValues: {
      test: [
        {
          firstName: 'Bill',
          lastName: 'Luo',
          keyValue: [{ name: '1a' }, { name: '1c' }],
        },
      ],
    },
  });
  const { fields, append, prepend, swap, move, insert, remove } = useFieldArray(
    {
      control,
      name: 'test',
    },
  );

  return (
    <form>
      {fields.map((item, index) => {
        return (
          <div key={item.id}>
            <input
              aria-label={`test.${index}.firstName`}
              defaultValue={`${item.firstName}`}
              {...register(`test.${index}.firstName` as const)}
            />
            <NestedArray control={control} name={`test.${index}.keyValue`} />
          </div>
        );
      })}

      <button
        id="append"
        type="button"
        onClick={() => append({ firstName: 'append' })}
      >
        append
      </button>

      <button
        id="prepend"
        type="button"
        onClick={() => prepend({ firstName: 'prepend' })}
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
        onClick={() => insert(1, { firstName: 'insert' })}
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
            test: [
              { firstName: 'test' },
              { firstName: 'test1' },
              { firstName: 'test2' },
            ],
          });
        }}
      >
        reset
      </button>
    </form>
  );
};
