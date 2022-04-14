import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { useController } from '../useController';
import { useForm } from '../useForm';
import { FormProvider, useFormContext } from '../useFormContext';
import { useFormState } from '../useFormState';
import { useWatch } from '../useWatch';

describe('FormProvider', () => {
  it('should have access to all methods with useFormContext', () => {
    const mockRegister = jest.fn();
    const Test = () => {
      const { register } = useFormContext();

      React.useEffect(() => {
        register('test');
      }, [register]);

      return null;
    };

    const App = () => {
      const methods = useForm();

      return (
        <FormProvider {...methods} register={mockRegister}>
          <form>
            <Test />
          </form>
        </FormProvider>
      );
    };

    render(<App />);

    expect(mockRegister).toHaveBeenCalled();
  });

  it('should work correctly with Controller, useWatch, useFormState.', async () => {
    const TestComponent = () => {
      const { field } = useController({
        name: 'test',
        defaultValue: '',
      });
      return <input {...field} />;
    };

    const TestWatch = () => {
      const value = useWatch({
        name: 'test',
      });

      return <p>Value: {value === undefined ? 'undefined value' : value}</p>;
    };

    const TestFormState = () => {
      const { isDirty } = useFormState();

      return <div>Dirty: {isDirty ? 'yes' : 'no'}</div>;
    };

    const Component = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <TestComponent />
          <TestWatch />
          <TestFormState />
        </FormProvider>
      );
    };

    render(<Component />);

    const input = screen.getByRole('textbox');

    expect(input).toBeVisible();
    expect(await screen.findByText('Value: undefined value')).toBeVisible();
    expect(screen.getByText('Dirty: no')).toBeVisible();

    fireEvent.change(input, { target: { value: 'test' } });
    expect(screen.getByText('Value: test')).toBeVisible();
    expect(screen.getByText('Dirty: yes')).toBeVisible();
  });

  it('should not throw type error', () => {
    type FormValues = {
      firstName: string;
    };

    type Context = {
      someValue: boolean;
    };

    function App() {
      const methods = useForm<FormValues, Context>();
      const { handleSubmit, register } = methods;

      return (
        <div>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(() => {})}>
              <input {...register('firstName')} placeholder="First Name" />
              <input type="submit" />
            </form>
          </FormProvider>
        </div>
      );
    }

    render(<App />);
  });
});
