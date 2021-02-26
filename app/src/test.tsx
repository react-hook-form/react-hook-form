import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Control } from '../../src/types';
import { useWatch } from '../../src/useWatch';

type FormValues = {
  options: { option: string }[];
};

const watchedValue: object[] = [];

const Test = ({ control }: { control: Control<FormValues> }) => {
  watchedValue.push(
    useWatch({
      control,
    }),
  );

  console.log(useWatch({
    control,
  }))

  return null;
};

const Component = () => {
  const { register, reset, control } = useForm<FormValues>({
    defaultValues: {
      options: [
        {
          option: 'yes',
        },
        {
          option: 'no',
        },
      ],
    }
  });
  const { fields } = useFieldArray({ name: 'options', control });

  React.useEffect(() => {
    // reset({
    //   options: [
    //     {
    //       option: 'yes',
    //     },
    //     {
    //       option: 'no',
    //     },
    //   ],
    // });
  }, [reset]);

  return (
    <form>
      {fields.map((_, i) => (
        <div key={i.toString()}>
          <input
            type="radio"
            value="yes"
            {...register(`options.${i}.option` as const)}
          />
          <input
            type="radio"
            value="no"
            {...register(`options.${i}.option` as const)}
          />
          <Test control={control} />
        </div>
      ))}
    </form>
  );
};

export default Component;
