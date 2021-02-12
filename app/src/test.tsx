import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Control } from '../../src/types';

type FormValues = {
  nest: {
    test: {
      value: string;
      nestedArray: {
        value: string;
      }[];
    }[];
  };
};
const ChildComponent = ({
  index,
  control,
}: {
  control: Control<FormValues>;
  index: number;
}) => {
  const { fields } = useFieldArray<FormValues>({
    name: `nest.test.${index}.nestedArray` as const,
    control,
  });

  return (
    <div>
      {fields.map((item, i) => (
        <input
          key={item.id}
          {...control.register(
            `nest.test.${index}.nestedArray.${i}.value` as const,
          )}
          // @ts-ignore
          defaultValue={item.value}
        />
      ))}
    </div>
  );
};

const Component = () => {
  const { control, watch } = useForm<{
    test: string;
  }>();

  console.log(watch());

  const {
    field: { value, ...rest },
  } = useController({
    name: 'test',
    control,
    defaultValue: '',
  });

  return <input type="checkbox" {...rest} checked={value} />;
};

export default Component;
