import { act, renderHook } from '@testing-library/react';

import { useFieldArray, useForm } from '../';

describe('issue 13260', () => {
  it('should update field array values when setValue is called on a nested field', () => {
    const { result } = renderHook(() => {
      const { control, setValue } = useForm({
        defaultValues: {
          test: [{ value: '1' }],
        },
      });
      const { fields } = useFieldArray({
        control,
        name: 'test',
      });
      return { setValue, fields };
    });

    expect(result.current.fields).toEqual([
      { id: expect.any(String), value: '1' },
    ]);

    act(() => {
      result.current.setValue('test.0.value' as any, '2');
    });

    expect(result.current.fields).toEqual([
      { id: expect.any(String), value: '2' },
    ]);
  });

  it('should update nested field array values when setValue is called on a deep nested field', () => {
    const { result } = renderHook(() => {
      const { control, setValue } = useForm({
        defaultValues: {
          test: [
            {
              items: [{ value: '1' }],
            },
          ],
        },
      });
      const { fields } = useFieldArray({
        control,
        name: 'test.0.items' as any,
      });
      return { setValue, fields };
    });

    expect(result.current.fields).toEqual([
      { id: expect.any(String), value: '1' },
    ]);

    act(() => {
      result.current.setValue('test.0.items.0.value' as any, '2');
    });

    expect(result.current.fields).toEqual([
      { id: expect.any(String), value: '2' },
    ]);
  });
});
