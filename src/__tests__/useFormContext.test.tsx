import React from 'react';
import { render } from '@testing-library/react';

import { useController } from '../useController';
import { useFieldArray } from '../useFieldArray';
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

  it('should work correctly with Controller, useWatch, useFormState.', () => {
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

      return <p>{value}</p>;
    };

    const TestFormState = () => {
      const { isDirty } = useFormState();

      return <div>{isDirty ? 'yes' : 'no'}</div>;
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

    const { asFragment } = render(<Component />);

    expect(asFragment()).toMatchSnapshot();
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

  it('should work correctly with field array', () => {
    type FormValues = {
      test: { name: string }[];
    };

    const Test = () => {
      const context = useFormContext<FormValues>();

      return (
        <>
          {context?.arrays?.test.map((field) => (
            <input key={field.id} />
          ))}
        </>
      );
    };

    const App = () => {
      const methods = useForm();
      const testField = useFieldArray({
        control: methods.control,
        name: 'test',
      });

      return (
        <FormProvider
          {...methods}
          arrays={{
            test: testField,
          }}
        >
          <form>
            <Test />
          </form>
        </FormProvider>
      );
    };

    render(<App />);
  });
});
