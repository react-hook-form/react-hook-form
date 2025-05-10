import React from 'react';
import { useForm } from '@bombillazo/rhf-plus';

const Watch: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState<boolean | undefined>(false);

  const { formState, handleSubmit, register } = useForm<{
    value: string;
  }>({
    isLoading,
  });
  const onSubmit = () => {};

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p id="state-value">{`${isLoading}`}</p>
      <p id="form-value">{`${formState.isLoading}`}</p>
      <input {...register('value')} placeholder="value" />

      <button
        id="toggle"
        onClick={() => {
          setIsLoading(!isLoading);
        }}
      >
        toggle loading
      </button>
      <button
        id="unset"
        onClick={() => {
          setIsLoading(undefined);
        }}
      >
        unset
      </button>
    </form>
  );
};

export default Watch;
