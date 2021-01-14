import * as React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { render } from '@testing-library/react';
import { FormProvider, useFormContext } from './useFormContext';
import { useForm } from './useForm';
import { useController } from './useController';
import { useWatch } from './useWatch';
import { useFormState } from './useFormState';

describe('FormProvider', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should have access to all methods with useFormContext', () => {
    const mockRegister = jest.fn();
    const { result } = renderHook(() => useFormContext(), {
      /* eslint-disable-next-line react/display-name */
      wrapper: (props: { children?: React.ReactNode }) => (
        // @ts-ignore
        <FormProvider register={mockRegister} {...props} />
      ),
    });
    const { register } = result.current;

    act(() => {
      register('test');
    });

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

      // todo: fix type
      return <p>{value as string}</p>;
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
});
