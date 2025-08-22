import { act, renderHook } from '@testing-library/react';

import { useForm } from '../../useForm';

describe('setValue with empty array validation', () => {
  it('should trigger validation when setting empty array with shouldValidate', async () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          items: [{ name: 'item1' }, { name: 'item2' }],
        },
        mode: 'onChange',
        resolver: (values) => {
          // Custom resolver to validate that items array is not empty
          if (!values.items || values.items.length === 0) {
            return {
              values: {},
              errors: {
                items: {
                  type: 'required',
                  message: 'Items cannot be empty',
                },
              },
            };
          }
          return { values, errors: {} };
        },
      }),
    );

    // Initially there should be no errors
    expect(result.current.formState.errors.items).toBeUndefined();

    await act(async () => {
      result.current.setValue('items', [], { shouldValidate: true });
    });

    // After setting empty array with shouldValidate, there should be an error
    expect(result.current.formState.errors.items).toEqual({
      type: 'required',
      message: 'Items cannot be empty',
    });
  });

  it('should trigger validation for nested field when setting empty array with shouldValidate', async () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          user: {
            tags: ['tag1', 'tag2'],
          },
        },
        mode: 'onChange',
        resolver: (values) => {
          if (!values.user?.tags || values.user.tags.length === 0) {
            return {
              values: {},
              errors: {
                user: {
                  tags: {
                    type: 'required',
                    message: 'Tags cannot be empty',
                  },
                },
              },
            };
          }
          return { values, errors: {} };
        },
      }),
    );

    expect(result.current.formState.errors.user?.tags).toBeUndefined();

    await act(async () => {
      result.current.setValue('user.tags', [], { shouldValidate: true });
    });

    expect(result.current.formState.errors.user?.tags).toEqual({
      type: 'required',
      message: 'Tags cannot be empty',
    });
  });

  it('should trigger validation with async resolver when setting empty array', async () => {
    const resolver = jest.fn(async (values) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      if (!values.items || values.items.length === 0) {
        return {
          values: {},
          errors: {
            items: {
              message: 'Items cannot be empty',
              type: 'required',
            },
          },
        };
      }
      return { values, errors: {} };
    });

    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          items: [{ name: 'item1' }],
        },
        resolver,
      }),
    );

    expect(result.current.formState.errors.items).toBeUndefined();

    await act(async () => {
      result.current.setValue('items', [], { shouldValidate: true });
      // Wait for async validation to complete
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(resolver).toHaveBeenCalled();
    expect(result.current.formState.errors.items).toEqual({
      message: 'Items cannot be empty',
      type: 'required',
    });
  });

  it('should trigger validation for deeply nested array field', async () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          data: {
            nested: {
              items: ['item1', 'item2'],
            },
          },
        },
        resolver: (values) => {
          if (
            !values.data?.nested?.items ||
            values.data.nested.items.length === 0
          ) {
            return {
              values: {},
              errors: {
                data: {
                  nested: {
                    items: {
                      type: 'required',
                      message: 'Nested items cannot be empty',
                    },
                  },
                },
              },
            };
          }
          return { values, errors: {} };
        },
      }),
    );

    expect(result.current.formState.errors.data?.nested?.items).toBeUndefined();

    await act(async () => {
      result.current.setValue('data.nested.items', [], {
        shouldValidate: true,
      });
    });

    expect(result.current.formState.errors.data?.nested?.items).toEqual({
      type: 'required',
      message: 'Nested items cannot be empty',
    });
  });
});
