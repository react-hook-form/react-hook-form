import React from 'react';
import { useForm } from 'react-hook-form';
import type { DefaultValues } from 'react-hook-form';

type FormValues = {
  focusInput: string;
  focusTextarea: string;
};

const defaultValues: DefaultValues<FormValues> = {
  focusInput: 'Input should be focused',
  focusTextarea: 'Textarea should be focused',
};

const SetFocus = () => {
  const { register, setFocus } = useForm<FormValues>({
    defaultValues,
  });

  return (
    <form>
      <fieldset>
        <legend>Focus input</legend>
        <label htmlFor="focusInput">Focus Input</label>
        <input id="focusInput" {...register('focusInput')} />
        <button type="button" onClick={() => setFocus('focusInput')}>
          Focus Input
        </button>
      </fieldset>
      <fieldset>
      </fieldset>
      <fieldset>
        <legend>Focus textarea</legend>
        <label htmlFor="focusTextarea">Focus Textarea</label>
        <textarea id="focusTextarea" {...register('focusTextarea')} />
        <button type="button" onClick={() => setFocus('focusTextarea')}>
          Focus Textarea
        </button>
      </fieldset>
    </form>
  );
};

export default SetFocus;
