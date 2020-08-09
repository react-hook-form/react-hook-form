/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { withRouter } from 'react-router';
import * as yup from 'yup';
import { yupResolver } from 'react-hook-form-resolvers';

let renderCounter = 0;

const validationSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().max(5).required(),
});

const formSubmitWithOnError: React.FC = () => {
  const [show, setShow] = React.useState(true);
  const [invalidMessage, setInvalidMessage] = React.useState('');
  const { register, handleSubmit, formState } = useForm<{
    firstName: string;
    lastName: string;
    select: string;
    radio: string;
    checkbox: string;
  }>({
    mode: 'onSubmit',
    resolver: yupResolver(validationSchema),
  });

  renderCounter++;

  return (
    <form
      onSubmit={handleSubmit(
        () => {},
        () => {
          setShow(false);
          setInvalidMessage('invoked onError callback');
        },
      )}
    >
      <input name="location" ref={register} placeholder="location" />
      {show && (
        <input name="firstName" ref={register} placeholder="firstName" />
      )}
      <input name="lastName" ref={register} placeholder="lastName" />
      <input name="age" ref={register} placeholder="age" />
      <div id="isValid">{JSON.stringify(formState.isValid)}</div>
      <div id="renderCount">{renderCounter}</div>
      <div id="invalid-message">{invalidMessage}</div>
      <button id="submit">Submit</button>
    </form>
  );
};

export default withRouter(formSubmitWithOnError);
