import { act, renderHook } from '@testing-library/react-hooks';

import { useForm } from '../../useForm';

describe('unregister', () => {
  it('should unregister an registered item', async () => {
    const { result } = renderHook(() => useForm<{ input: string }>());

    result.current.register('input');

    await act(async () => {
      await result.current.unregister('input');
    });

    expect(result.current.getValues()).toEqual({});
  });

  it('should unregister an registered item with array name', async () => {
    const { result } = renderHook(() =>
      useForm<{
        input: string;
        input2: string;
      }>(),
    );

    result.current.register('input');
    result.current.register('input');
    result.current.register('input2');

    await act(async () => {
      await result.current.unregister(['input', 'input2']);
    });

    expect(result.current.getValues()).toEqual({});
  });

  it('should unregister all inputs', async () => {
    const { result } = renderHook(() =>
      useForm<{
        input: string;
        input2: string;
      }>(),
    );

    result.current.register('input');
    result.current.register('input');
    result.current.register('input2');

    await act(async () => {
      await result.current.unregister();
    });

    expect(result.current.getValues()).toEqual({});
  });
});
