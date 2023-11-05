import React from 'react';
import { act,fireEvent, render, screen } from '@testing-library/react';

import { SmartForm } from '../smartForm';

describe('SmartForm', () => {
  const onSubmit = jest.fn();

  it('should render a form with children', () => {
    render(
      <SmartForm defaultValues={{ fullName: 'John Doe' }} onSubmit={onSubmit}>
        {({ register }) => (
          <>
            <input {...register('fullName')} />
            <button>Submit</button>
          </>
        )}
      </SmartForm>
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should get form field values', async () => {
    render(
      <SmartForm defaultValues={{ fullName: 'John Doe' }} onSubmit={onSubmit}>
        {({ getValues }) => {
          const values = getValues();
          return <div>{values.fullName}</div>;
        }}
      </SmartForm>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should get field state', async () => {
    let fieldState;
    render(
      <SmartForm defaultValues={{ fullName: 'John Doe' }} onSubmit={onSubmit}>
        {({ getFieldState }) => {
          fieldState = getFieldState('fullName');
          return null;
        }}
      </SmartForm>
    );

    expect(fieldState).toEqual({
      invalid: false,
      isDirty: false,
      isTouched: false,
      error: undefined,
    });
  });

  it('should reset the form', async () => {
    render(
      <SmartForm defaultValues={{ fullName: 'John Doe' }} onSubmit={onSubmit}>
        {({ reset, getValues }) => (
          <>
            <div>{getValues('fullName')}</div>
            <button onClick={() => reset()}>Reset</button>
          </>
        )}
      </SmartForm>
    );

    act(() => {
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

});
