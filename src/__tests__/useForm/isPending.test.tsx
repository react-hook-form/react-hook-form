import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useForm } from '../../useForm';

describe('useForm isPending option', () => {
  it('should reflect initial isPending value on formState.isSubmitting', async () => {
    const { result } = renderHook((props: any) => useForm(props), {
      initialProps: { isPending: true },
    });

    await waitFor(() => expect(result.current.formState.isSubmitting).toBe(true));
  });

  it('should sync formState.isSubmitting when isPending prop changes', async () => {
    const { result, rerender } = renderHook((props: any) => useForm(props), {
      initialProps: { isPending: false },
    });

    expect(result.current.formState.isSubmitting).toBe(false);

    act(() => rerender({ isPending: true }));

    await waitFor(() =>
      expect(result.current.formState.isSubmitting).toBe(true),
    );

    act(() => rerender({ isPending: false }));

    await waitFor(() =>
      expect(result.current.formState.isSubmitting).toBe(false),
    );
  });
});
