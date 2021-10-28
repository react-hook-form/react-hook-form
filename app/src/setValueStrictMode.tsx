import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

const SetValueAsyncStrictMode = () => {
  const { register, setValue, control } = useForm<{
    firstName: string;
  }>();

  useEffect(() => {
    setTimeout(() => {
      console.log('wrong');
      setValue('firstName', 'wrong', { shouldDirty: true });
    }, 1000);
  }, [register, setValue]);

  return (
    <React.StrictMode>
      <form>
        <Controller
          defaultValue={'test'}
          control={control}
          render={({ field }) => {
            console.log(field.value);
            return <input {...field} />;
          }}
          name={'firstName'}
        />

        <button id="submit">Submit</button>
      </form>
    </React.StrictMode>
  );
};

export default SetValueAsyncStrictMode;
