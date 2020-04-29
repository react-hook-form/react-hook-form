import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import useForm from './index';

describe('useFormEventListeners', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return error type correctly and update form state', () => {
    const { result } = renderHook(() => useForm());

    const { container } = render(
      <input name="test" ref={result.current.register} />,
    );

    act(() => {
      fireEvent.input(container.querySelector('input')!);
    });

    expect(result.current.formState).toMatchSnapshot();
  });

  it('should skip when field is not included in the validationFields', () => {
    const { result } = renderHook(() =>
      useForm({
        validationFields: ['nothing'],
      }),
    );

    const { container } = render(
      <input name="test" ref={result.current.register({ required: true })} />,
    );

    act(() => {
      fireEvent.input(container.querySelector('input')!);
    });

    expect(result.current.formState).toMatchSnapshot();
  });
});
