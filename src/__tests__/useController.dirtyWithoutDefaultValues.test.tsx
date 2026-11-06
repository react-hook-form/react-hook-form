import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import type { Control, UseFormProps } from '../types';
import { useController } from '../useController';
import { useForm } from '../useForm';

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
};

function Input({
  control,
  name,
}: {
  control: Control<FormValues>;
  name: keyof FormValues;
}) {
  const { field, fieldState } = useController({
    control,
    name,
    defaultValue: '',
  });

  return (
    <label>
      {name}
      <input aria-label={name} {...field} />
      <span data-testid={`${name}-dirty`}>{String(fieldState.isDirty)}</span>
    </label>
  );
}

const renderForm = (props?: UseFormProps<FormValues>) => {
  const formState: { dirtyFields?: unknown; isDirty?: boolean } = {};

  function App() {
    const { control, formState: state } = useForm<FormValues>(props);
    formState.dirtyFields = state.dirtyFields;
    formState.isDirty = state.isDirty;

    return (
      <>
        <Input control={control} name="firstName" />
        <Input control={control} name="lastName" />
        <Input control={control} name="email" />
      </>
    );
  }

  render(<App />);

  return formState;
};

describe('useController defaultValue without useForm defaultValues', () => {
  it.each([
    ['omitted', undefined],
    ['an empty object', { defaultValues: {} }],
  ])(
    'should only mark the changed field as dirty when useForm defaultValues is %s',
    (_, props) => {
      const formState = renderForm(props);

      fireEvent.change(screen.getByLabelText('firstName'), {
        target: { value: 'a' },
      });

      expect(formState.dirtyFields).toEqual({ firstName: true });
      expect(formState.isDirty).toBe(true);
      expect(screen.getByTestId('firstName-dirty')).toHaveTextContent('true');
      expect(screen.getByTestId('lastName-dirty')).toHaveTextContent('false');
      expect(screen.getByTestId('email-dirty')).toHaveTextContent('false');
    },
  );

  it('should not be dirty on mount', () => {
    const formState = renderForm();

    expect(formState.dirtyFields).toEqual({});
    expect(formState.isDirty).toBe(false);
  });

  it('should become pristine again when the changed field returns to its default', () => {
    const formState = renderForm();

    fireEvent.change(screen.getByLabelText('firstName'), {
      target: { value: 'a' },
    });
    fireEvent.change(screen.getByLabelText('firstName'), {
      target: { value: '' },
    });

    expect(formState.dirtyFields).toEqual({});
    expect(formState.isDirty).toBe(false);
    expect(screen.getByTestId('firstName-dirty')).toHaveTextContent('false');
  });

  it('should not mark siblings dirty when another field with a form default is reverted', () => {
    const formState = renderForm({
      defaultValues: { firstName: 'x' } as FormValues,
    });

    fireEvent.change(screen.getByLabelText('firstName'), {
      target: { value: 'xa' },
    });
    fireEvent.change(screen.getByLabelText('lastName'), {
      target: { value: 'b' },
    });
    fireEvent.change(screen.getByLabelText('firstName'), {
      target: { value: 'x' },
    });

    expect(formState.dirtyFields).toEqual({ lastName: true });
    expect(screen.getByTestId('email-dirty')).toHaveTextContent('false');
  });

  it('should keep useForm defaultValues over the controller defaultValue', () => {
    const formState = renderForm({
      defaultValues: { firstName: 'x', lastName: '', email: '' },
    });

    fireEvent.change(screen.getByLabelText('firstName'), {
      target: { value: '' },
    });

    expect(formState.dirtyFields).toEqual({ firstName: true });
    expect(formState.isDirty).toBe(true);
  });
});
