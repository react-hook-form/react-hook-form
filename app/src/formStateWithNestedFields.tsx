import React from 'react';
import { useForm } from 'react-hook-form';
import { withRouter } from 'react-router';

let renderCounter = 0;

const FormStateWithNestedFields: React.FC = (props: any) => {
  const {
    register,
    handleSubmit,
    formState: {
      dirtyFields,
      isSubmitted,
      submitCount,
      touched,
      isDirty,
      isSubmitting,
      isSubmitSuccessful,
      isValid,
    },
    reset,
  } = useForm<{
    [topLevelKey: string]: {
      [nestedKey: number]: string;
    };
  }>({
    mode: props.match.params.mode,
    defaultValues: {
      left: {
        1: '',
        2: '',
      },
      right: {
        1: '',
        2: '',
      },
    },
  });

  renderCounter++;

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h4>Left</h4>
          <input
            name="left.1"
            ref={register({ required: true })}
            placeholder="firstName"
          />
          <input
            name="left.2"
            ref={register({ required: true })}
            placeholder="lastName"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h4>Right</h4>
          <input
            name="right.1"
            ref={register({ required: false })}
            placeholder="firstName"
          />
          <input
            name="right.2"
            ref={register({ required: false })}
            placeholder="lastName"
          />
        </div>
      </div>
      <div id="state">
        {JSON.stringify({
          isDirty,
          isSubmitted,
          submitCount,
          isSubmitting,
          isSubmitSuccessful,
          isValid,
          touched: Object.keys(touched).flatMap((topLevelKey) =>
            Object.keys(touched[topLevelKey] || {}).map(
              (nestedKey) => `${topLevelKey}.${nestedKey}`,
            ),
          ),
          dirtyFields: Object.keys(dirtyFields).flatMap((topLevelKey) =>
            Object.keys(dirtyFields[topLevelKey] || {}).map(
              (nestedKey) => `${topLevelKey}.${nestedKey}`,
            ),
          ),
        })}
      </div>
      <button id="submit">Submit</button>
      <button type="button" onClick={() => reset()} id="resetForm">
        Reset
      </button>
      <div id="renderCount">{renderCounter}</div>
    </form>
  );
};

export default withRouter(FormStateWithNestedFields);
