import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { useForm } from 'react-hook-form';

function DefaultValues() {
  const { register, watch, setValue, handleSubmit, getValues } = useForm<any>({
    immerFormValues: true,
    defaultValues: {
      test: {
        firstName: 'firstName',
        lastName: 'lastName',
      },
      test2: 'test2',
    },
  });
  const test = watch('test');
  useEffect(() => {
    console.log('test', test);
  }, [test]);
  console.log(test);
  let { ref, ...rest } = register('test.firstName', {
    setInputValueAs: (inputValue) => {
      return JSON.stringify(inputValue);
    },
    immerFormValues: true,
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
          setValue('test', {
            firstName: 'firstName22222',
            lastName: 'lastName33333',
          });
        }}
      >
        setValue
      </button>
    </>
  );
}

export default DefaultValues;
