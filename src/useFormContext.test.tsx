import * as React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { FormContext, useFormContext } from './useFormContext';

describe('FormContext', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should have access to all methods with useFormContext', () => {
    const control = {
      register: jest.fn(),
      defaultValuesRef: {
        current: {},
      },
      watchFieldArrayRef: {
        current: {},
      },
      defaultRenderValuesRef: {
        current: {},
      },
    };
    const { result } = renderHook(() => useFormContext(), {
      /* eslint-disable-next-line react/display-name */
      wrapper: (props: { children?: React.ReactNode }) => (
        // @ts-ignore
        <FormContext control={control} {...props} />
      ),
    });
    const { register } = result.current;

    act(() => {
      register('test');
    });

    expect(control.register).toHaveBeenCalled();
  });
});
