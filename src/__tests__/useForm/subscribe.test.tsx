import { waitFor } from '@testing-library/react';

import { createFormControl } from '../../logic';

describe('subscribe', () => {
  it('should subscribe to correct form state', () => {
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
