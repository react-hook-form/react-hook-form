import React from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';

import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';

// Breaking changes listed for V8 that have not shipped yet. Switch to `it`
// once a change lands, or delete the test if it is dropped from V8.
describe('V8 breaking changes', () => {
  it.failing('should not call a watch callback', () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useForm<{ test: string }>({ defaultValues: { test: '' } }),
    );

    act(() => {
      (result.current.watch as unknown as (callback: () => void) => void)(
        callback,
      );
    });

    act(() => {
      result.current.setValue('test', 'test');
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it.failing('should not update useFieldArray fields with setValue', () => {
    let setValue: (name: 'items', value: { value: string }[]) => void;

    const Component = () => {
      const form = useForm<{ items: { value: string }[] }>({
        defaultValues: { items: [{ value: 'a' }] },
      });
      const { fields } = useFieldArray({
        control: form.control,
        name: 'items',
      });
      setValue = form.setValue;

      return <p>{`fields: ${fields.length}`}</p>;
    };

    render(<Component />);

    act(() => {
      setValue('items', [{ value: 'a' }, { value: 'b' }]);
    });

    expect(screen.getByText('fields: 1')).toBeVisible();
  });
});
