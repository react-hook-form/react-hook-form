import React from 'react';
import { useForm } from '@bombillazo/rhf-plus';

export default function IsDirtySinceSubmit() {
  const { register, handleSubmit, formState, reset, setValue } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  const onSubmit = (data: Record<string, string>) => {
    console.log('Form submitted:', data);
  };

  return (
    <div>
      <h1>Is Dirty Since Submit Test</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('firstName')}
          placeholder="First Name"
          id="firstName"
        />

        <input
          {...register('lastName')}
          placeholder="Last Name"
          id="lastName"
        />

        <input {...register('email')} placeholder="Email" id="email" />

        <button type="submit" id="submit">
          Submit
        </button>
        <button type="button" onClick={() => reset()} id="reset">
          Reset
        </button>
        <button
          type="button"
          onClick={() => setValue('firstName', 'John')}
          id="setValueButton"
        >
          Set First Name
        </button>
      </form>

      <div id="state">
        {JSON.stringify({
          isDirty: formState.isDirty,
          isDirtySinceSubmit: formState.isDirtySinceSubmit,
          isSubmitted: formState.isSubmitted,
          submitCount: formState.submitCount,
          dirtyFields: Object.keys(formState.dirtyFields),
        })}
      </div>
    </div>
  );
}
