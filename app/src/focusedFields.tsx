import React from 'react';
import { useForm, useFormState, Control } from '@bombillazo/rhf-plus';

type FormInputs = {
  firstName: string;
  lastName: string;
  email: string;
  nested: {
    field: string;
  };
};

const FocusDisplay = ({ control }: { control: Control<FormInputs> }) => {
  const { focusedField } = useFormState({ control });

  return (
    <div
      id="focused-state"
      style={{
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div id="focused-field">{focusedField || 'none'}</div>
      <div id="firstName-focused">
        {focusedField === 'firstName'
          ? 'firstName focused'
          : 'firstName not focused'}
      </div>
      <div id="lastName-focused">
        {focusedField === 'lastName'
          ? 'lastName focused'
          : 'lastName not focused'}
      </div>
      <div id="email-focused">
        {focusedField === 'email' ? 'email focused' : 'email not focused'}
      </div>
      <div id="nested-focused">
        {focusedField === 'nested.field'
          ? 'nested focused'
          : 'nested not focused'}
      </div>
      <div id="focused-field-json">{JSON.stringify({ focusedField })}</div>
    </div>
  );
};

export const FocusedFields: React.FC = () => {
  const { register, control, reset } = useForm<FormInputs>();

  return (
    <div>
      <form>
        <input
          id="firstName"
          {...register('firstName')}
          placeholder="First Name"
        />
        <input
          id="lastName"
          {...register('lastName')}
          placeholder="Last Name"
        />
        <input id="email" {...register('email')} placeholder="Email" />
        <input
          id="nestedField"
          {...register('nested.field')}
          placeholder="Nested Field"
        />
        <button type="button" id="resetButton" onClick={() => reset()}>
          Reset
        </button>
      </form>
      <FocusDisplay control={control} />
    </div>
  );
};
