import { act, renderHook } from '@testing-library/react-hooks';
import { useFieldArray } from './useFieldArray';
import { appendId } from './logic/mapIds';
import { reconfigureControl } from './useForm.test';

jest.mock('./logic/generateId', () => ({
  default: () => '1',
}));

describe('useFieldArray', () => {
  it('should return default fields value', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl(),
        name: 'test',
      }),
    );

    expect(result.current.fields).toEqual([]);
  });

  it('should append data into the fields', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl(),
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
          ...reconfigureControl(),
          getValues: () => ({
            test: [],
          }),
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
        control: reconfigureControl({
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }] },
          },
        }),
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
        control: reconfigureControl({
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }] },
          },
          getValues: () => ({
            test: [],
          }),
          fieldsRef: {
            current: {
              'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
              'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
            },
          },
        }),
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
        control: reconfigureControl(),
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
        control: reconfigureControl({
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }] },
          },
          getValues: () => ({
            test: [],
          }),
          fieldsRef: {
            current: {
              'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
              'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
            },
          },
        }),
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
  });

  it('should swap data order', () => {
    const { result } = renderHook(() =>
      useFieldArray({
        control: reconfigureControl({
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }] },
          },
          getValues: () => ({
            test: [],
          }),
          fieldsRef: {
            current: {
              'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
              'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
            },
          },
        }),
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
        control: reconfigureControl({
          defaultValuesRef: {
            current: { test: [{ test: '1' }, { test: '2' }, { test: '3' }] },
          },
          getValues: () => ({
            test: [],
          }),
          fieldsRef: {
            current: {
              'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
              'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
              'test[2]': { ref: { name: 'test[2]', value: { test: '3' } } },
            },
          },
        }),
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
  });
});

test('should append id to the value', () => {
  expect(appendId({ test: 'test' })).toEqual({
    test: 'test',
    id: '1',
  });
});
