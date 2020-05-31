import React from 'react';
import { useForm, useFieldArray } from './src';
import { object, array, string } from 'yup';

const validationSchema = object().shape({
  questions: array()
    .of(
      object().shape({
        text: string().required('Some text is required'),
      }),
    )
    .required(),
});

function App() {
  const {
    control,
    register,
    errors,
    clearError,
    setValue,
    unregister,
    handleSubmit,
    triggerValidation,
  } = useForm({
    mode: 'onChange',
    validationSchema,
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
    keyName: 'key',
  });

  const isInitalRender = React.useRef(true);
  const appendQuestion = () => {
    append({
      text: '',
    });

    if (errors.questions?.type === 'min') {
      clearError('questions'); // always clear errors when there is add action.
    }
  };

  React.useEffect(() => {
    if (!fields.length) {
      register('questions');
      setValue('questions', []);
      if (!isInitalRender.current) {
        triggerValidation();
      }
    } else {
      unregister('questions');
    }

    if (isInitalRender.current) {
      isInitalRender.current = false;
    }
  }, [fields, register, setValue, unregister, triggerValidation]);

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <h1>Yup Validation - Field Array</h1>
      {fields.map((question, questionIndex) => (
        <div key={question.key}>
          <input
            ref={register()}
            name={`questions[${questionIndex}].text`}
            control={control}
            defaultValue=""
          />

          <button
            type="button"
            onClick={() => {
              remove(questionIndex);
              triggerValidation();
            }}
          >
            Remove question {question.id}
          </button>
        </div>
      ))}
      <p>Errors: {JSON.stringify(errors)}</p>
      <button type="buttoon" onClick={appendQuestion}>
        Add question
      </button>
      <input type="submit" />
    </form>
  );
}
