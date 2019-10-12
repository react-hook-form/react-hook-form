import React from 'react';
import useForm from 'react-hook-form';

function Reset() {
  const { register, reset } = useForm<{
    firstName: string;
    lastName: string;
    objectData: {
      test: string;
    };
    array: string[];
    deepNest: {
      level1: {
        level2: {
          data: string;
        };
      };
    };
  }>();
  return (
    <>
      <input name="firstName" ref={register} />
      <input name="array[1]" ref={register} />
      <input name="objectData.test" ref={register} />
      <input name="lastName" ref={register} />
      <input name="deepNest.level1.level2.data" ref={register} />
      <button
        type="button"
        onClick={() =>
          reset({
            firstName: 'bill',
            lastName: 'luo',
            array: ['', 'test'],
            objectData: { test: 'data' },
            deepNest: {
              level1: {
                level2: {
                  data: 'hey',
                },
              },
            },
          })
        }
      >
        button
      </button>
    </>
  );
}

export default Reset;
