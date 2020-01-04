import { act, renderHook } from '@testing-library/react-hooks';
import { useFieldArray } from './useFieldArray';

jest.mock('./logic/generateId', () => ({
  default: () => '1',
}));

describe('useFieldArray', () => {
  it('should return default fields value', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        getValues: () => ({}),
        name: 'test',
      }),
    );

    expect(result.current.fields).toEqual([]);
  });

  it('should append data into the fields', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        getValues: () => ({}),
        name: 'test',
      }),
    );

    act(() => {
      result.current.append({ test: 'test' });
    });

    expect(result.current.fields).toEqual([{ id: '1', test: 'test' }]);
  });

  it('should populate default values into fields', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        getValues: () => ({ test: [{ test: '1' }, { test: '2' }] }),
        name: 'test',
      }),
    );

    expect(result.current.fields).toEqual([
      { test: '1', id: '1' },
      { test: '2', id: '1' },
    ]);
  });
});
