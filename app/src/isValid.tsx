import * as React from 'react';
import { useForm } from 'react-hook-form';
import { withRouter } from 'react-router';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

let renderCounter = 0;

const validationSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().max(5).required(),
});

const IsValid: React.FC = (props: any) => {
  const isBuildInValidation = props.match.params.mode === 'build-in';
  const [show, setShow] = React.useState(true);
  const {
    register,
    handleSubmit,
    unregister,
    formState: { isValid },
  } = useForm<{
    firstName: string;
    lastName: string;
    hidden: string;
    age: string;
    location: string;
    select: string;
    radio: string;
    checkbox: string;
  }>({
    mode: 'onChange',
    ...(isBuildInValidation ? {} : { resolver: yupResolver(validationSchema) }),
    ...(props.match.params.defaultValues === 'defaultValues'
      ? {
          defaultValues: {
            firstName: 'test',
            lastName: 'test1',
          },
        }
      : {}),
  });

  React.useEffect(() => {
    if (isBuildInValidation) {
      if (show) {
        unregister('hidden');
      }
    } else {
      if (!show) {
        unregister('firstName');
      }
    }
  }, [show, isBuildInValidation, unregister]);

  renderCounter++;

  return (
    <form onSubmit={handleSubmit(() => {})}>
      {isBuildInValidation ? (
        <>
          <input
            name="location"
            {...register('location')}
            placeholder="location"
          />
          <input
            name="firstName"
            {...register('firstName', { required: true })}
            placeholder="firstName"
          />
          <input
            name="lastName"
            {...register('lastName', { required: true })}
            placeholder="lastName"
          />
          {!show && (
            <input
              name="hidden"
              {...register('hidden', { required: true })}
              placeholder="hidden"
            />
          )}
          <input name="age" {...register('age')} placeholder="age" />
        </>
      ) : (
        <>
          <input
            name="location"
            {...register('location')}
            placeholder="location"
          />
          {show && (
            <input
              name="firstName"
              {...register('firstName')}
              placeholder="firstName"
            />
          )}
          <input
            name="lastName"
            {...register('lastName')}
            placeholder="lastName"
          />
          <input name="age" {...register('age')} placeholder="age" />
        </>
      )}
      <div id="isValid">{JSON.stringify(isValid)}</div>
      <div id="renderCount">{renderCounter}</div>

      <button
        type="button"
        id="toggle"
        onClick={() => {
          setShow(!show);
        }}
      >
        Toggle
      </button>
    </form>
  );
};

export default withRouter(IsValid);
