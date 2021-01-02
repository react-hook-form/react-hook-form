import * as React from 'react';
import { useFieldArray, useForm, Control } from 'react-hook-form';

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
  const { fields } = useFieldArray({
    // @ts-ignore
    name: `nest.test[${index}].nestedArray`,
    control,
  });

  console.log('chil', fields);

  return (
    <>
      {fields.map((item, i) => (
        <input
          key={item.id}
          {...control.register(
            `nest.test.${index}.nestedArray.${i}.value` as any,
          )}
          // @ts-ignore
          defaultValue={item.value}
        />
      ))}
    </>
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

  console.log(fields);

  return (
    <>
      {fields.map((item, i) => (
        <div key={item.id}>
          <input
            {...register(`nest.test.${i}.value` as any)}
            defaultValue={item.value}
          />
          <div>
            child:
            <ChildComponent control={control} index={i} />
          </div>
        </div>
      ))}

      <button type={'button'} onClick={() => prepend({ value: 'test' })}>
        prepend
      </button>
    </>
  );
};

export default Component;
