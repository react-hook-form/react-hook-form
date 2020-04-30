import * as React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { FormProvider, useFormContext } from './useFormContext';

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
});
