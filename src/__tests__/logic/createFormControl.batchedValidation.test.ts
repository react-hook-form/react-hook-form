import { act, renderHook, waitFor } from '@testing-library/react';

import { useForm } from '../../useForm';

describe('createFormControl - batched validation with microtask queue', () => {
  it('should batch validation when multiple fields are registered in the same render cycle', async () => {
    let validationCallCount = 0;

    const resolver = jest.fn(async (values) => {
      validationCallCount++;
      return {
        values,
        errors: {},
      };
    });

    const { result } = renderHook(() =>
      useForm({
        resolver,
        mode: 'onChange',
        defaultValues: {
          field1: '',
          field2: '',
          field3: '',
        },
      }),
    );

    // Register multiple fields in the same cycle
    act(() => {
      result.current.register('field1');
      result.current.register('field2');
      result.current.register('field3');
    });

    // Wait for batched validation to complete
    await waitFor(() => {
      // Validation should only be called once for all three fields
      expect(validationCallCount).toBe(1);
    });
  });

  it('should prevent multiple validation calls during initial registration', async () => {
    let validationCallCount = 0;

    const resolver = jest.fn(async (values) => {
      validationCallCount++;
      // Simulate async delay
      await new Promise((resolve) => setTimeout(resolve, 10));
      return {
        values,
        errors: {},
      };
    });

    const { result } = renderHook(() =>
      useForm({
        resolver,
        mode: 'onChange',
      }),
    );

    // Register multiple fields rapidly
    act(() => {
      result.current.register('field1');
      result.current.register('field2');
      result.current.register('field3');
    });

    // Wait for validation
    await waitFor(() => {
      // Should batch validation calls
      expect(validationCallCount).toBeLessThanOrEqual(1);
    });
  });

  it('should handle rapid field registration and unregistration', async () => {
    const resolver = jest.fn(async (values) => ({
      values,
      errors: {},
    }));

    const { result } = renderHook(() =>
      useForm({
        resolver,
        shouldUnregister: true,
      }),
    );

    // Rapidly register and unregister fields
    act(() => {
      result.current.register('field1');
      result.current.register('field2');
      result.current.unregister('field1');
      result.current.register('field3');
      result.current.unregister('field2');
    });

    await waitFor(() => {
      // Should handle all operations without errors
      expect(result.current.getValues()).toEqual({ field3: undefined });
    });
  });

  it('should maintain validation order with batched validation', async () => {
    const validationOrder: string[] = [];

    const resolver = jest.fn(async (values) => {
      validationOrder.push(JSON.stringify(Object.keys(values).sort()));
      return {
        values,
        errors: {},
      };
    });

    const { result } = renderHook(() =>
      useForm({
        resolver,
        defaultValues: {
          field1: 'value1',
          field2: 'value2',
          field3: 'value3',
        },
      }),
    );

    // Register fields
    act(() => {
      result.current.register('field3');
      result.current.register('field1');
      result.current.register('field2');
    });

    await waitFor(() => {
      // Should validate all fields together
      expect(validationOrder.length).toBe(1);
      expect(validationOrder[0]).toBe('["field1","field2","field3"]');
    });
  });

  it('should execute validation in microtask after render', async () => {
    const executionOrder: string[] = [];

    const resolver = jest.fn(async (values) => {
      executionOrder.push('validation');
      return {
        values,
        errors: {},
      };
    });

    const { result } = renderHook(() =>
      useForm({
        resolver,
      }),
    );

    act(() => {
      result.current.register('field1');
      executionOrder.push('after-register');
    });

    // Synchronous code executes first
    expect(executionOrder).toEqual(['after-register']);

    // Wait for microtask
    await waitFor(() => {
      expect(executionOrder).toEqual(['after-register', 'validation']);
    });
  });

  it('should clear pending validation queue on unmount', async () => {
    const resolver = jest.fn(async (values) => ({
      values,
      errors: {},
    }));

    const { result, unmount } = renderHook(() =>
      useForm({
        resolver,
      }),
    );

    act(() => {
      result.current.register('field1');
      result.current.register('field2');
    });

    // Unmount before validation completes
    unmount();

    // Should not throw or cause memory leaks
    await waitFor(() => {
      expect(resolver).toHaveBeenCalledTimes(0);
    });
  });
});