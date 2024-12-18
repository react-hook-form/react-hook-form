import React, { useImperativeHandle, useRef } from 'react';
import { useForm } from 'react-hook-form';

function DefaultValues() {
  const { register, watch, setValue, handleSubmit } = useForm<any>({
    defaultValues: {
      test: {
        firstName: 'firstName',
        lastName: 'lastName',
      },
    },
  });
  const test = watch('test');
  let { ref, ...rest } = register('test', {
    setInputValueAs: (inputValue) => {
      return JSON.stringify(inputValue);
    },
  });
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current);

  return (
    <>
      <form
        onChange={(e) => {
          console.log(e);
        }}
        onSubmit={handleSubmit((data) => {
          console.log(data);
        })}
      >
        <input {...rest} ref={inputRef} />
        <button type="submit">submit</button>
      </form>

      <button
        type={'button'}
        id={'toggle'}
        onClick={() => {
          setValue(
            'test',
            { firstName: 'firstName3', lastName: 'lastName3' },
            { shouldValidate: true },
          );
        }}
      >
        setValue
      </button>

      {JSON.stringify(test)}
    </>
  );
}

export default DefaultValues;
