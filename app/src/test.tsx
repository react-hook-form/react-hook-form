// @ts-nocheck
import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Control, UseFormRegister } from '../../src/types';

type FormValues = {
  test: { name: string }[];
};

const FieldArray = ({
  control,
  register,
}: {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
}) => {
  const { fields, append } = useFieldArray({
    control,
    name: 'test',
  });

  return (
    <div>
      {fields.map((field, index) => {
        return (
          <input key={field.id} {...register(`test.${index}.name` as const)} />
        );
      })}
      <button
        onClick={() => {
          append({ name: '' });
        }}
      >
        append
      </button>
    </div>
  );
};

const App = () => {
  const [show, setShow] = React.useState(true);
  const { control, register, reset } = useForm<FormValues>();

  return (
    <div>
      {show && <FieldArray control={control} register={register} />}
      <button
        onClick={() => {
          setShow(!show);
        }}
      >
        toggle
      </button>
      <button
        onClick={() => {
          reset({
            test: [{ name: 'test' }],
          });
        }}
      >
        reset
      </button>
    </div>
  );
};

export default App;
