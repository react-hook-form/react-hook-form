import React from 'react';
import { useForm } from 'react-hook-form';
import type { DefaultValues } from 'react-hook-form';

type FormValues = {
  focusInput: string;
  selectInputContent: string;
  focusTextarea: string;
  selectTextareaContent: string;
  focusUnfocusable: number;
  selectUnfocusable: number;
};

const defaultValues: DefaultValues<FormValues> = {
  focusInput: 'Input should be focused',
  selectInputContent: 'Content should be selected',
  focusTextarea: 'Textarea should be focused',
  selectTextareaContent: 'Content should be selected',
  focusUnfocusable: 1,
  selectUnfocusable: 1,
};

const SetFocus = () => {
  const { register, watch, setValue, setFocus } = useForm<FormValues>({
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
        <legend>Select input content on focus</legend>
        <label htmlFor="selectInputContent">Select Content</label>
        <input id="selectInputContent" {...register('selectInputContent')} />
        <button
          type="button"
          onClick={() => setFocus('selectInputContent', { shouldSelect: true })}
        >
          Select Input Content
        </button>
      </fieldset>
      <fieldset>
        <legend>Focus textarea</legend>
        <label htmlFor="focusTextarea">Focus Textarea</label>
        <textarea id="focusTextarea" {...register('focusTextarea')} />
        <button type="button" onClick={() => setFocus('focusTextarea')}>
          Focus Textarea
        </button>
      </fieldset>
      <fieldset>
        <legend>Select textarea content on focus</legend>
        <label htmlFor="selectTextareaContent">Focus Textarea</label>
        <textarea
          id="selectTextareaContent"
          {...register('selectTextareaContent')}
        />
        <button
          type="button"
          onClick={() =>
            setFocus('selectTextareaContent', { shouldSelect: true })
          }
        >
          Select Textarea Content
        </button>
      </fieldset>
      <fieldset>
        <legend>Don't focus unfocusable input</legend>
        <label htmlFor="focusUnfocusable">Unfocusable Input</label>
        <div>Value: {watch('focusUnfocusable')}</div>
        <a
          id="focusUnfocusable"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            setValue('focusUnfocusable', watch('focusUnfocusable') + 1);
          }}
        >
          Click to increment
        </a>
        <button type="button" onClick={() => setFocus('focusUnfocusable')}>
          Do Not Focus
        </button>
      </fieldset>
      <fieldset>
        <legend>Don't select unfocusable input</legend>
        <label htmlFor="selectUnfocusable">Unfocusable Input</label>
        <div>Value: {watch('selectUnfocusable')}</div>
        <a
          id="selectUnfocusable"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            setValue('selectUnfocusable', watch('selectUnfocusable') + 1);
          }}
        >
          Click to increment
        </a>
        <button
          type="button"
          onClick={() => setFocus('focusUnfocusable', { shouldSelect: true })}
        >
          Do Not Select
        </button>
      </fieldset>
    </form>
  );
};

export default SetFocus;
