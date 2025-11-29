import { act } from 'react';
import { renderHook } from '@testing-library/react';

import { useForm } from '../../useForm';

describe('isDirty and dirtyFields divergence (issue #13141)', () => {
  it('should keep isDirty and dirtyFields consistent when using shouldDirty: false', () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { firstName: '', lastName: '' } }),
    );

    result.current.formState.isDirty;
    result.current.formState.dirtyFields;

    result.current.register('firstName');
    result.current.register('lastName');

    act(() => {
      result.current.setValue('firstName', 'X', { shouldDirty: false });
    });

    expect(result.current.formState.isDirty).toBe(false);
    expect(result.current.formState.dirtyFields).toEqual({});

    act(() => {
      result.current.setValue('lastName', 'Y', { shouldDirty: true });
    });

    expect(result.current.formState.isDirty).toBe(true);
    expect(result.current.formState.dirtyFields).toEqual({
      lastName: true,
    });

    act(() => {
      result.current.setValue('lastName', '', { shouldDirty: true });
    });

    expect(result.current.formState.isDirty).toBe(false);
    expect(result.current.formState.dirtyFields).toEqual({});

    expect(result.current.getValues()).toEqual({
      firstName: 'X',
      lastName: '',
    });
  });

  it('should handle mixed shouldDirty: true and shouldDirty: false correctly', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          field1: 'a',
          field2: 'b',
          field3: 'c',
        },
      }),
    );

    result.current.formState.isDirty;
    result.current.formState.dirtyFields;

    result.current.register('field1');
    result.current.register('field2');
    result.current.register('field3');

    act(() => {
      result.current.setValue('field1', 'x', { shouldDirty: false });
    });

    expect(result.current.formState.isDirty).toBe(false);
    expect(result.current.formState.dirtyFields).toEqual({});

    act(() => {
      result.current.setValue('field2', 'y', { shouldDirty: true });
    });

    expect(result.current.formState.isDirty).toBe(true);
    expect(result.current.formState.dirtyFields).toEqual({ field2: true });

    act(() => {
      result.current.setValue('field3', 'z', { shouldDirty: false });
    });

    expect(result.current.formState.isDirty).toBe(true);
    expect(result.current.formState.dirtyFields).toEqual({ field2: true });

    act(() => {
      result.current.setValue('field2', 'b', { shouldDirty: true });
    });

    expect(result.current.formState.isDirty).toBe(false);
    expect(result.current.formState.dirtyFields).toEqual({});
  });
});
