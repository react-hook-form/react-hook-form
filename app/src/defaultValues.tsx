import React from 'react';
import useForm from 'react-hook-form';

function DefaultValues() {
  const { register } = useForm({
    defaultValues: {
      test: 'test',
      test1: {
        firstName: 'firstName',
        lastName: ['lastName0', 'lastName1'],
        deep: {
          nest: 'nest',
        },
      },
      'flatName[1].whatever': 'flat'
    },
  });

  return (
    <form>
      <input name="test" ref={register} />
      <input name="test1.firstName" ref={register} />
      <input name="test1.deep.nest" ref={register} />
      <input name="test1.deep.nest.notFound" ref={register} />
      <input name="test1.lastName[0]" ref={register} />
      <input name="test1.lastName[1]" ref={register} />
      <input name="flatName[1].whatever" ref={register} />
    </form>
  );
}

export default DefaultValues;
