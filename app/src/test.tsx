import * as React from 'react';
import { useController, useForm } from 'react-hook-form';

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
