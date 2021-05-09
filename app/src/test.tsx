import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Control, UseFormRegister } from '../../src/types';
import { Controller } from '../../src';

type FormValues = {
  test: string;
  test1: string;
  test2: {
    value: string;
  }[];
};

const Child = ({
  control,
  register,
}: {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
}) => {
  const { fields } = useFieldArray({
    control,
    name: 'test2',
    shouldUnregister: true,
  });

  return (
    <>
      {fields.map((field, i) => (
        <input
          key={field.id}
          {...register(`test2.${i}.value` as const)}
          defaultValue={field.value}
        />
      ))}
    </>
  );
};

let submittedData: FormValues[] = [];
submittedData = [];

const Component = () => {
  const [show, setShow] = React.useState(true);
  const { register, handleSubmit, control } = useForm<FormValues>({
    shouldUnregister: true,
    defaultValues: {
      test: 'bill',
      test1: 'bill1',
      test2: [{ value: 'bill2' }],
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        console.log('!!data', data);
        submittedData.push(data);
      })}
    >
      {show && (
        <>
          <input {...register('test')} />
          <Controller
            control={control}
            render={({ field }) => <input {...field} />}
            name={'test1'}
          />
          <Child control={control} register={register} />
        </>
      )}
      <button>Submit</button>
      <button type={'button'} onClick={() => setShow(false)}>
        Toggle
      </button>
    </form>
  );
};

export default Component;
