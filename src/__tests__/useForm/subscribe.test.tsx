import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { createFormControl } from '../../logic';
import { useForm } from '../../useForm';

describe('subscribe', () => {
  it('should subscribe to correct form state and prevent form re-render', async () => {
    const callback = jest.fn();

    const control = createFormControl({
      defaultValues: {
        test: '',
      },
    });
    const { subscribe, register, setValue } = control;

    subscribe({
      formState: {
        isDirty: true,
        dirtyFields: true,
        values: true,
      },
      callback,
    });

    register('test');
    setValue('test', 'data', { shouldDirty: true });

    expect(callback).lastCalledWith({
      values: { test: 'data' },
      submitCount: 0,
      isDirty: true,
      isLoading: false,
      isValidating: false,
      isSubmitted: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
      touchedFields: {},
      dirtyFields: { test: true },
      validatingFields: {},
      errors: {},
      disabled: false,
      name: 'test',
    });

    let renderCount = 0;

    const App = () => {
      useForm({
        control,
      });

      renderCount++;

      return <p>{renderCount === 1 ? 'yes' : 'no'}</p>;
    };

    render(<App />);

    await waitFor(() => {
      screen.getByText('yes');
    });
  });

  it('should re-render by hook form state subscription', async () => {
    const callback = jest.fn();

    const control = createFormControl({
      defaultValues: {
        test: '',
      },
    });
    const { subscribe, register, setValue } = control;

    subscribe({
      formState: {
        values: true,
      },
      callback,
    });

    register('test');
    setValue('test', 'data', { shouldDirty: true });

    let renderCount = 0;

    const App = () => {
      const {
        formState: { isDirty },
      } = useForm({
        control,
      });

      isDirty;
      renderCount++;

      return <p>{renderCount === 2 ? 'yes' : 'no'}</p>;
    };

    render(<App />);

    await waitFor(() => {
      screen.getByText('yes');
    });
  });

  it('should only subscribe to individual field', () => {
    const callback = jest.fn();

    const { subscribe, register, setValue } = createFormControl({
      defaultValues: {
        test: '',
      },
    });

    subscribe({
      formState: {
        isDirty: true,
        dirtyFields: true,
        isValid: true,
        values: true,
      },
      name: 'other',
      callback,
    });

    register('test', { required: true });
    setValue('test', 'data', { shouldDirty: true, shouldValidate: true });

    expect(callback).not.toBeCalled();
  });
});
