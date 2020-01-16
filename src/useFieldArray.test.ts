import { act, renderHook } from '@testing-library/react-hooks';
import { useFieldArray } from './useFieldArray';
import { appendId } from './logic/mapIds';

jest.mock('./logic/generateId', () => ({
  default: () => '1',
}));

describe('useFieldArray', () => {
  it('should return default fields value', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: {
          fieldsRef: { crrent: {} },
          isDirtyRef: { current: false },
          fieldArrayNamesRef: { current: new Set() },
          defaultValues: {},
          resetFieldArrayFunctionRef: {
            current: {},
          },
        },
        name: 'test',
      }),
    );

    expect(result.current.fields).toEqual([]);
  });

  it('should append data into the fields', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: {
          isDirtyRef: { current: false },
          fieldsRef: { crrent: {} },
          fieldArrayNamesRef: { current: new Set() },
          getValues: () => ({}),
          defaultValues: {},
          resetFieldArrayFunctionRef: {
            current: {},
          },
        },
        name: 'test',
      }),
    );

    act(() => {
      result.current.append({ test: 'test' });
    });

    expect(result.current.fields).toEqual([{ id: '1', test: 'test' }]);

    act(() => {
      result.current.append({ test: 'test1' });
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: 'test' },
      { id: '1', test: 'test1' },
    ]);

    act(() => {
      result.current.append({});
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: 'test' },
      { id: '1', test: 'test1' },
      { id: '1' },
    ]);
  });

  it('should pre-append data into the fields', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: {
          isDirtyRef: { current: false },
          fieldsRef: { crrent: {} },
          fieldArrayNamesRef: { current: new Set() },
          getValues: () => ({}),
          defaultValues: {},
          resetFieldArrayFunctionRef: {
            current: {},
          },
        },
        name: 'test',
      }),
    );

    act(() => {
      result.current.prepend({ test: 'test' });
    });

    expect(result.current.fields).toEqual([{ id: '1', test: 'test' }]);

    act(() => {
      result.current.prepend({ test: 'test1' });
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: 'test1' },
      { id: '1', test: 'test' },
    ]);

    act(() => {
      result.current.prepend({});
    });

    expect(result.current.fields).toEqual([
      { id: '1' },
      { id: '1', test: 'test1' },
      { id: '1', test: 'test' },
    ]);
  });

  it('should populate default values into fields', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: {
          isDirtyRef: { current: false },
          fieldsRef: { crrent: {} },
          fieldArrayNamesRef: { current: new Set() },
          defaultValues: { test: [{ test: '1' }, { test: '2' }] },
          resetFieldArrayFunctionRef: {
            current: {},
          },
        },
        name: 'test',
      }),
    );

    expect(result.current.fields).toEqual([
      { test: '1', id: '1' },
      { test: '2', id: '1' },
    ]);
  });

  it('should remove field according index', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: {
          isDirtyRef: { current: false },
          fieldsRef: { crrent: {} },
          fieldArrayNamesRef: { current: new Set() },
          defaultValues: { test: [{ test: '1' }, { test: '2' }] },
          resetFieldArrayFunctionRef: {
            current: {},
          },
        },
        name: 'test',
      }),
    );

    act(() => {
      result.current.remove(1);
    });

    expect(result.current.fields).toEqual([{ test: '1', id: '1' }]);
  });

  it('should remove all fields when index not supplied', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: {
          isDirtyRef: { current: false },
          fieldsRef: { crrent: {} },
          fieldArrayNamesRef: { current: new Set() },
          getValues: () => ({ test: [{ test: '1' }, { test: '2' }] }),
          defaultValues: {},
          resetFieldArrayFunctionRef: {
            current: {},
          },
        },
        name: 'test',
      }),
    );

    act(() => {
      result.current.remove();
    });

    expect(result.current.fields).toEqual([]);
  });

  it('should insert data at index', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: {
          isDirtyRef: { current: false },
          fieldsRef: { crrent: {} },
          fieldArrayNamesRef: { current: new Set() },
          defaultValues: { test: [{ test: '1' }, { test: '2' }] },
          resetFieldArrayFunctionRef: {
            current: {},
          },
        },
        name: 'test',
      }),
    );

    act(() => {
      result.current.insert(1, { test: '3' });
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: '1' },
      { id: '1', test: '3' },
      { id: '1', test: '2' },
    ]);

    act(() => {
      result.current.insert(1, {});
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: '1' },
      { id: '1' },
      { id: '1', test: '3' },
      { id: '1', test: '2' },
    ]);
  });

  it('should swap data order', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: {
          isDirtyRef: { current: false },
          fieldsRef: { crrent: {} },
          fieldArrayNamesRef: { current: new Set() },
          defaultValues: { test: [{ test: '1' }, { test: '2' }] },
          resetFieldArrayFunctionRef: {
            current: {},
          },
        },
        name: 'test',
      }),
    );

    act(() => {
      result.current.swap(0, 1);
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: '2' },
      { id: '1', test: '1' },
    ]);
  });

  it('should move into pointed position', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: {
          isDirtyRef: { current: false },
          fieldsRef: { crrent: {} },
          fieldArrayNamesRef: { current: new Set() },
          defaultValues: {
            test: [{ test: '1' }, { test: '2' }, { test: '3' }],
          },
          resetFieldArrayFunctionRef: {
            current: {},
          },
        },
        name: 'test',
      }),
    );

    act(() => {
      result.current.move(2, 0);
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: '3' },
      { id: '1', test: '1' },
      { id: '1', test: '2' },
    ]);

    act(() => {
      result.current.move(1, 0);
    });

    expect(result.current.fields).toEqual([
      { id: '1', test: '1' },
      { id: '1', test: '3' },
      { id: '1', test: '2' },
    ]);
  });
});

test('should append id to the value', () => {
  expect(appendId({ test: 'test' })).toEqual({
    test: 'test',
    id: '1',
  });
});

test('should skip append id when there is id present', () => {
  expect(appendId({ test: 'test', id: '2' })).toEqual({
    test: 'test',
    id: '2',
  });
});
