import React from 'react';
import { useForm, ValidationMode } from 'react-hook-form';

const ChangeInputType = () => {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    resetField,
  } = useForm<{
    type: string;
    value: string | number | boolean;
  }>({
    defaultValues: {
      type: 'text',
      value: 'hello',
    },
  });
  
  const type = watch("type");
  
  React.useEffect(() => {
      const typeToValue = {
          text: "hello",
          number: 42,
          checkbox: true,
      }
      resetField("value", {
          defaultValue: typeToValue[type] ?? "unknown",
      });
  }, [type]);

  return (
    <form
      onSubmit={handleSubmit((d) => {
        console.log(d);
      })}
    >
      <input
        {...register('type', { required: true })}
        placeholder="type"
      />
      <input
        {...register('value', { required: true })}
        type={type}
      />
      <div id="state">
        {JSON.stringify({
          type,
          value: getValues("value"),
        })}
      </div>
    </form>
  );
};

export default ChangeInputType;
