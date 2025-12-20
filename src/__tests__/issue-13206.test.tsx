import { act, renderHook } from '@testing-library/react';

import { useForm } from '../useForm';

test('setValue should notify observers exactly once when field is watched', async () => {
  const { result } = renderHook(() => useForm());
  const control = result.current.control as any;

  control._names.watch.add('test');

  const nextSpy = jest.spyOn(control._subjects.state, 'next');

  await act(async () => {
    result.current.setValue('test', 'value');
  });

  expect(nextSpy).toHaveBeenCalledTimes(1);
});
