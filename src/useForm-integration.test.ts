import { renderHook, act } from '@testing-library/react-hooks';
import { useForm } from './useForm';

describe('getValues', () => {
  describe('nest: false', () => {
    it('should returned a flattened version of defaultValues', () => {
      const { result } = renderHook(() =>
        useForm({
          defaultValues: {
            foo: 'bar',
            complex: {
              field: 'value',
            },
          },
        }),
      );
      act(() => {
        const values = result.current.getValues({ nest: false });

        expect(values).toEqual({
          foo: 'bar',
          'complex.field': 'value',
        });
      });
    });
  });
});

describe('watch', () => {
  describe('nest: false', () => {
    it('should returned a flattened version of defaultValues', () => {
      const { result } = renderHook(() =>
        useForm({
          defaultValues: {
            foo: 'bar',
            complex: {
              field: 'value',
            },
          },
        }),
      );
      act(() => {
        const values = result.current.watch({ nest: false });

        expect(values).toEqual({
          foo: 'bar',
          'complex.field': 'value',
        });
      });
    });
  });
});
