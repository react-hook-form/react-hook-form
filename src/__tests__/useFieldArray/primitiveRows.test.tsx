import { act, renderHook } from '@testing-library/react';

import { useFieldArray } from '../../useFieldArray';
import { useForm } from '../../useForm';

describe('useFieldArray row values', () => {
  it.each([
    { type: 'string', value: '', other: 'ab' },
    { type: 'number', value: 0, other: 1 },
    { type: 'boolean', value: false, other: true },
  ])(
    'should expose $type row values through append, update and replace',
    ({ value, other }) => {
      const { result } = renderHook(() => {
        const form = useForm<{ items: (string | number | boolean)[] }>({
          defaultValues: { items: [value, other] },
        });

        return {
          ...useFieldArray({ control: form.control, name: 'items' }),
          getValues: form.getValues,
        };
      });
      const expectRows = (values: (string | number | boolean)[]) => {
        expect(result.current.fields).toEqual(
          values.map((value) => ({ value, key: expect.any(String) })),
        );
        expect(result.current.fields.map((field) => field.value)).toEqual(
          values,
        );
        expect(result.current.getValues('items')).toEqual(values);
      };

      expectRows([value, other]);

      const key = result.current.fields[0].key;

      act(() => result.current.append(value));
      expectRows([value, other, value]);
      expect(result.current.fields[0].key).toBe(key);

      act(() => result.current.update(1, value));
      expectRows([value, value, value]);
      expect(result.current.fields[0].key).toBe(key);

      act(() => result.current.replace([other, value]));
      expectRows([other, value]);
    },
  );

  it.each([true, false, undefined])(
    'should preserve primitive values when disabled is %s',
    (disabled) => {
      const { result } = renderHook(() => {
        const { control } = useForm({
          defaultValues: { items: ['', 0, false] },
        });

        return useFieldArray({ control, name: 'items', disabled });
      });

      expect(result.current.fields).toEqual(
        ['', 0, false].map((value) => ({
          value,
          key: expect.any(String),
          ...(disabled === undefined ? {} : { disabled }),
        })),
      );
    },
  );

  it('should keep object rows and their declared value properties spread', () => {
    class Row {
      constructor(public name: string) {}
    }

    const nullPrototypeRow = Object.assign(Object.create(null), {
      name: 'null prototype',
    });
    const items = [
      { name: 'first' },
      { name: 'second', value: 0, key: 'stored', disabled: true },
      new Row('class'),
      nullPrototypeRow,
    ];
    const { result } = renderHook(() => {
      const { control } = useForm({ defaultValues: { items } });

      return useFieldArray({ control, name: 'items', disabled: false });
    });

    expect(result.current.fields).toEqual(
      items.map((item) => ({
        ...item,
        key: expect.any(String),
        disabled: false,
      })),
    );
    expect(result.current.fields[0]).not.toHaveProperty('value');
  });

  it('should switch between primitive and object rows through update', () => {
    const { result } = renderHook(() => {
      const { control } = useForm<{
        items: (string | { name: string })[];
      }>({ defaultValues: { items: ['initial', { name: 'object' }] } });

      return useFieldArray({ control, name: 'items' });
    });

    expect(result.current.fields).toEqual([
      { value: 'initial', key: expect.any(String) },
      { name: 'object', key: expect.any(String) },
    ]);

    act(() => result.current.update(0, { name: 'updated' }));
    expect(result.current.fields[0]).toEqual({
      name: 'updated',
      key: expect.any(String),
    });

    act(() => result.current.update(0, 'primitive'));
    expect(result.current.fields[0]).toEqual({
      value: 'primitive',
      key: expect.any(String),
    });
  });

  it('should keep enumerable function row properties spread', () => {
    const row = Object.assign(() => 'result', { label: 'function row' });
    const { result } = renderHook(() => {
      const { control } = useForm({
        defaultValues: { items: [row] },
      });

      return useFieldArray({ control, name: 'items' });
    });

    expect(result.current.fields).toEqual([
      { label: 'function row', key: expect.any(String) },
    ]);
    expect(result.current.fields[0]).not.toHaveProperty('value');
  });
});
