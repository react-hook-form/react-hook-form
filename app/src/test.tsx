// @ts-nocheck
import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Control } from '../../src/types';

type FormInputs = {
  nest: {
    test: {
      value: string;
      nestedArray: { value: string }[];
    }[];
  };
};

const ChildComponent = ({
  index,
  control,
}: {
  control: Control<FormInputs>;
  index: number;
}) => {
  const { fields } = useFieldArray<FormInputs>({
    name: `nest.test.${index}.nestedArray` as const,
    control,
  });

  console.log('fields', `nest.test.${index}.nestedArray`, fields);

  return (
    <div style={{ marginLeft: 20 }}>
      <h3>Child</h3>
      {fields.map((item, i) => (
        <input
          key={item.id}
          {...control.register(
            `nest.test.${index}.nestedArray.${i}.value` as const,
          )}
        />
      ))}
    </div>
  );
};

const Component = () => {
  const { register, control } = useForm<FormInputs>({
    defaultValues: {
      nest: {
        test: [
          { value: '1', nestedArray: [{ value: '2' }, { value: '3' }] },
          { value: '4', nestedArray: [{ value: '5' }] },
        ],
      },
    },
  });
  const { fields, prepend } = useFieldArray({
    name: 'nest.test',
    control,
  });

  return (
    <>
      {fields.map((item, i) => (
        <div key={item.id}>
          <input {...register(`nest.test.${i}.value` as const)} />
          <ChildComponent control={control} index={i} />
          <hr />
        </div>
      ))}

      <button type={'button'} onClick={() => prepend({ value: 'test' })}>
        prepend
      </button>
    </>
  );
};

export default Component;
