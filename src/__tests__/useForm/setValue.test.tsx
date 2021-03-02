import { act, renderHook } from '@testing-library/react-hooks';
import { useForm } from '../../useForm';
import * as React from 'react';
import isFunction from '../../utils/isFunction';
import { NestedValue } from '../../types';
import get from '../../utils/get';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { VALIDATION_MODE } from '../../constants';

describe('setValue', () => {
  it('should not setValue for unmounted state with shouldUnregister', () => {
    const { result } = renderHook(() => useForm<{ test1: string }>());

    result.current.register('test1');
    result.current.setValue('test1', 'data');
  });

  it('should empty string when value is null or undefined when registered field is HTMLElement', () => {
    const { result } = renderHook(() =>
      useForm<{ test?: string | null }>({
        defaultValues: {
          test: 'test',
        },
      }),
    );

    const elm = document.createElement('input');
    elm.type = 'text';
    elm.name = 'test';

    result.current.register('test');

    result.current.setValue('test', null);

    expect(elm).not.toHaveValue();

    result.current.setValue('test', undefined);

    expect(elm).not.toHaveValue();
  });

  it('should set value of radio input correctly', async () => {
    const { result } = renderHook(() => useForm<{ test: string }>());

    result.current.register('test');

    result.current.setValue('test', '1');

    await act(async () => {
      await result.current.handleSubmit((data) => {
        expect(data).toEqual({
          test: '1',
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });
  });

  it('should set value of file input correctly if value is FileList', async () => {
    const { result } = renderHook(() => useForm<{ test: FileList }>());

    result.current.register('test');

    const blob = new Blob([''], { type: 'image/png', lastModified: 1 } as any);
    const file = blob as File;
    const fileList = ({
      0: file,
      1: file,
      length: 2,
      item: () => file,
    } as any) as FileList;

    act(() => result.current.setValue('test', fileList));

    await act(async () => {
      await result.current.handleSubmit((data) => {
        expect(data).toEqual({
          test: fileList,
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });
  });

  it('should set value of multiple checkbox input correctly', async () => {
    const { result } = renderHook(() => useForm<{ test: string[] }>());

    const { ref } = result.current.register('test');

    const elm = document.createElement('input');
    elm.type = 'checkbox';
    elm.name = 'test';
    elm.value = '2';

    document.body.append(elm);
    isFunction(ref) && ref(elm);

    const { ref: ref1 } = result.current.register('test');

    const elm1 = document.createElement('input');
    elm1.type = 'checkbox';
    elm1.name = 'test';
    elm1.value = '1';

    document.body.append(elm1);

    isFunction(ref1) && ref1(elm1);

    result.current.setValue('test', ['1']);

    await act(async () => {
      await result.current.handleSubmit((data) => {
        expect(data).toEqual({
          test: ['1'],
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });
  });

  it('should set value of single checkbox input correctly', async () => {
    const { result } = renderHook(() => useForm<{ test: string }>());

    result.current.register('test');

    result.current.setValue('test', '1');

    await act(async () => {
      await result.current.handleSubmit((data) => {
        expect(data).toEqual({
          test: '1',
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });
  });

  it('should set value of multiple select correctly', async () => {
    const { result } = renderHook(() => useForm<{ test: string[] }>());
    const { ref } = result.current.register('test');

    isFunction(ref) &&
      ref({
        type: 'checkbox',
        refs: [{}, {}],
      });

    result.current.setValue('test', ['1']);

    await act(async () => {
      await result.current.handleSubmit((data) => {
        expect(data).toEqual({
          test: ['1'],
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });
  });

  it('should set object array value', () => {
    const { result } = renderHook(() =>
      useForm<{
        test: {
          one: string;
          two: string;
          three: string;
        }[];
      }>(),
    );

    result.current.register('test.0.one');
    result.current.register('test.0.two');
    result.current.register('test.0.three');

    act(() => {
      result.current.setValue('test', [
        {
          one: 'ONE',
          two: 'TWO',
          three: 'THREE',
        },
      ]);
    });

    expect(result.current.getValues()).toEqual({
      test: [
        {
          one: 'ONE',
          two: 'TWO',
          three: 'THREE',
        },
      ],
    });
  });

  it('should set unmountFieldsState value when shouldUnregister is set to false', async () => {
    const { result } = renderHook(() =>
      useForm<{
        test: string;
        checkbox: string[];
        test1: { one: string; two: string; three: string }[];
      }>(),
    );

    act(() => {
      result.current.setValue('test', '1');
      result.current.setValue('checkbox', ['1', '2']);
      result.current.setValue('test1.0', {
        one: 'ONE',
        two: 'TWO',
        three: 'THREE',
      });
    });
  });

  it('should set nested value correctly ', () => {
    const { result } = renderHook(() =>
      useForm<{
        test1: NestedValue<string[]>;
        test2: NestedValue<{
          key1: string;
          key2: number;
        }>;
        test3: NestedValue<
          {
            key1: string;
            key2: number;
          }[]
        >;
      }>(),
    );

    result.current.register('test1');
    result.current.register('test2');
    result.current.register('test3');

    act(() => {
      result.current.setValue('test1', ['1', '2', '3']);
      result.current.setValue('test2', { key1: '1', key2: 2 });
      result.current.setValue('test3', [
        { key1: '1', key2: 2 },
        { key1: '3', key2: 4 },
      ]);
    });

    expect(result.current.control.fieldsRef.current['test1']).toEqual({
      _f: {
        ref: { name: 'test1', value: ['1', '2', '3'] },
        name: 'test1',
        value: ['1', '2', '3'],
      },
    });
    expect(result.current.control.fieldsRef.current['test2']).toEqual({
      _f: {
        ref: { name: 'test2', value: { key1: '1', key2: 2 } },
        name: 'test2',
        value: { key1: '1', key2: 2 },
      },
    });
    expect(result.current.control.fieldsRef.current['test3']).toEqual({
      _f: {
        ref: {
          name: 'test3',
          value: [
            { key1: '1', key2: 2 },
            { key1: '3', key2: 4 },
          ],
        },
        name: 'test3',
        value: [
          { key1: '1', key2: 2 },
          { key1: '3', key2: 4 },
        ],
      },
    });
  });

  it('should work with array fields', () => {
    const { result } = renderHook(() =>
      useForm<{
        test: string[];
        test1: {
          test: string;
        }[];
      }>(),
    );

    result.current.register('test1.0.test');
    result.current.register('test.0');
    result.current.register('test.1');
    result.current.register('test.2');

    act(() => result.current.setValue('test', ['1', '2', '3']));

    expect(get(result.current.control.fieldsRef.current, 'test.0')).toEqual({
      _f: {
        ref: { name: 'test.0', value: '1' },
        name: 'test.0',
        value: '1',
      },
    });
    expect(get(result.current.control.fieldsRef.current, 'test.1')).toEqual({
      _f: {
        ref: { name: 'test.1', value: '2' },
        name: 'test.1',
        value: '2',
      },
    });
    expect(get(result.current.control.fieldsRef.current, 'test.2')).toEqual({
      _f: {
        ref: { name: 'test.2', value: '3' },
        name: 'test.2',
        value: '3',
      },
    });
  });

  it('should worked with nested array fields with object', () => {
    const { result } = renderHook(() =>
      useForm<{
        test: {
          test: string;
        }[];
      }>(),
    );

    result.current.register('test.0.test');
    result.current.register('test.1.test');
    result.current.register('test.2.test');

    act(() =>
      result.current.setValue('test', [
        { test: '1' },
        { test: '2' },
        { test: '3' },
      ]),
    );

    expect(
      get(result.current.control.fieldsRef.current, 'test.0.test'),
    ).toEqual({
      _f: {
        ref: { name: 'test.0.test', value: '1' },
        name: 'test.0.test',
        value: '1',
      },
    });
    expect(
      get(result.current.control.fieldsRef.current, 'test.1.test'),
    ).toEqual({
      _f: {
        ref: { name: 'test.1.test', value: '2' },
        name: 'test.1.test',
        value: '2',
      },
    });
    expect(
      get(result.current.control.fieldsRef.current, 'test.2.test'),
    ).toEqual({
      _f: {
        ref: { name: 'test.2.test', value: '3' },
        name: 'test.2.test',
        value: '3',
      },
    });
  });

  it('should work with object fields', () => {
    const { result } = renderHook(() =>
      useForm<{
        test1: {
          test: string;
        }[];
        test: {
          bill: string;
          luo: string;
          test: string;
        };
      }>(),
    );

    result.current.register('test1.0.test');
    result.current.register('test.bill');
    result.current.register('test.luo');
    result.current.register('test.test');

    act(() =>
      result.current.setValue('test', { bill: '1', luo: '2', test: '3' }),
    );
    expect(get(result.current.control.fieldsRef.current, 'test.bill')).toEqual({
      _f: {
        ref: { name: 'test.bill', value: '1' },
        name: 'test.bill',
        value: '1',
      },
    });
    expect(get(result.current.control.fieldsRef.current, 'test.luo')).toEqual({
      _f: {
        ref: { name: 'test.luo', value: '2' },
        name: 'test.luo',
        value: '2',
      },
    });
    expect(get(result.current.control.fieldsRef.current, 'test.test')).toEqual({
      _f: {
        ref: { name: 'test.test', value: '3' },
        name: 'test.test',
        value: '3',
      },
    });
  });

  it('should not work if field is not registered', () => {
    const { result } = renderHook(() => useForm());

    act(() => {
      result.current.setValue('test', '1');
    });

    expect(result.current.control.fieldsRef.current['test']).toBeUndefined();
  });

  describe('with watch', () => {
    it('should get watched value', () => {
      const { result } = renderHook(() => {
        const { register, watch, setValue } = useForm<{ test: string }>();

        register('test');

        React.useEffect(() => {
          setValue('test', 'abc');
        }, [setValue]);

        return watch('test');
      });

      expect(result.current).toBe('abc');
    });
  });

  describe('with validation', () => {
    it('should be called trigger method if shouldValidate variable is true', async () => {
      const { result } = renderHook(() =>
        useForm<{
          test: string;
        }>(),
      );

      result.current.register('test', {
        minLength: {
          value: 5,
          message: 'min',
        },
      });

      result.current.formState.dirtyFields;

      await act(async () =>
        result.current.setValue('test', 'abc', {
          shouldValidate: true,
        }),
      );

      expect(result.current.formState.errors?.test?.message).toBe('min');
    });

    it('should not be called trigger method if options is empty', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register('test', {
        minLength: {
          value: 5,
          message: 'min',
        },
      });

      result.current.setValue('test', 'abc');

      expect(result.current.formState.errors?.test).toBeUndefined();
    });

    it('should be called trigger method if shouldValidate variable is true and field value is array', async () => {
      const { result } = renderHook(() =>
        useForm<{
          test: string[];
        }>(),
      );

      const rules = {
        minLength: {
          value: 5,
          message: 'min',
        },
      };

      result.current.register('test.0', rules);
      result.current.register('test.1', rules);
      result.current.register('test.2', rules);

      await act(async () =>
        result.current.setValue('test', ['abc1', 'abc2', 'abc3'], {
          shouldValidate: true,
        }),
      );

      expect(result.current.formState.errors?.test?.[0]?.message).toBe('min');
      expect(result.current.formState.errors?.test?.[1]?.message).toBe('min');
      expect(result.current.formState.errors?.test?.[2]?.message).toBe('min');
    });

    it('should not be called trigger method if options is empty and field value is array', async () => {
      const { result } = renderHook(() =>
        useForm<{
          test: string[];
        }>(),
      );

      const rules = {
        minLength: {
          value: 5,
          message: 'min',
        },
      };

      result.current.register('test.0', rules);
      result.current.register('test.1', rules);
      result.current.register('test.2', rules);

      act(() => result.current.setValue('test', ['test', 'test1', 'test2']));

      expect(result.current.formState.errors?.test).toBeUndefined();
    });
  });

  describe('with dirty', () => {
    it.each(['isDirty', 'dirtyFields'])(
      'should be dirtyFields when %s is defined when shouldDirty is true',
      (property) => {
        const { result } = renderHook(() => useForm<{ test: string }>());

        result.current.formState[property as 'dirtyFields' | 'isDirty'];
        result.current.formState.isDirty;

        result.current.register('test');

        act(() =>
          result.current.setValue('test', 'test', { shouldDirty: true }),
        );

        expect(result.current.formState.isDirty).toBeTruthy();
        expect(result.current.formState.dirtyFields).toEqual({ test: true });
      },
    );

    it.each([
      ['isDirty', ['test1', 'test2', 'test3'], [true, true, true]],
      ['dirty', ['test1', 'test2', 'test3'], [true, true, true]],
      ['isDirty', ['test1', '', 'test3'], [true, undefined, true]],
      ['dirty', ['test1', '', 'test3'], [true, undefined, true]],
    ])(
      'should be dirtyFields when %s is defined when shouldDirty is true with array fields',
      (property, values, dirtyFields) => {
        const { result } = renderHook(() =>
          useForm<{
            test: string[];
          }>({
            defaultValues: {
              test: ['', '', ''],
            },
          }),
        );

        result.current.formState[property as 'isDirty' | 'dirtyFields'];
        result.current.formState.isDirty;

        result.current.register('test.0');
        result.current.register('test.1');
        result.current.register('test.2');

        act(() =>
          result.current.setValue('test', values, {
            shouldDirty: true,
          }),
        );

        expect(result.current.formState.isDirty).toBeTruthy();
        expect(result.current.formState.dirtyFields).toEqual({
          test: dirtyFields,
        });
      },
    );

    it.each(['isDirty', 'dirtyFields'])(
      'should not be dirtyFields when %s is defined when shouldDirty is false',
      (property) => {
        const { result } = renderHook(() =>
          useForm<{
            test: string;
          }>(),
        );

        result.current.formState[property as 'isDirty' | 'dirtyFields'];

        result.current.register('test');

        act(() =>
          result.current.setValue('test', 'test', { shouldDirty: false }),
        );

        expect(result.current.formState.isDirty).toBeFalsy();
        expect(result.current.formState.dirtyFields).toEqual({});
      },
    );

    it.each(['isDirty', 'dirtyFields'])(
      'should set name to dirtyFieldRef if field value is different with default value when formState.dirtyFields is defined',
      (property) => {
        const { result } = renderHook(() =>
          useForm<{ test: string }>({
            defaultValues: { test: 'default' },
          }),
        );
        result.current.formState[property as 'dirtyFields' | 'isDirty'];
        result.current.formState.isDirty;

        result.current.register('test');

        act(() => result.current.setValue('test', '1', { shouldDirty: true }));

        expect(result.current.formState.isDirty).toBeTruthy();
        expect(result.current.formState.dirtyFields.test).toBeTruthy();
      },
    );

    it.each(['isDirty', 'dirtyFields'])(
      'should unset name from dirtyFieldRef if field value is not different with default value when formState.dirtyFields is defined',
      (property) => {
        const { result } = renderHook(() =>
          useForm<{ test: string }>({
            defaultValues: { test: 'default' },
          }),
        );
        result.current.formState[property as 'isDirty' | 'dirtyFields'];
        result.current.formState.isDirty;

        result.current.register('test');

        act(() => result.current.setValue('test', '1', { shouldDirty: true }));

        expect(result.current.formState.isDirty).toBeTruthy();
        expect(result.current.formState.dirtyFields.test).toBeTruthy();

        act(() =>
          result.current.setValue('test', 'default', { shouldDirty: true }),
        );

        expect(result.current.formState.isDirty).toBeFalsy();
        expect(result.current.formState.dirtyFields.test).toBeUndefined();
      },
    );
  });

  it('should set hidden input value correctly and reflect on the submission data', async () => {
    let submitData = undefined;

    const Component = () => {
      const { register, handleSubmit, setValue } = useForm<{
        test: string;
      }>();

      return (
        <div>
          <input type="hidden" defaultValue="test" {...register('test')} />
          <button
            onClick={() => {
              setValue('test', 'changed');
            }}
          >
            change
          </button>
          <button
            onClick={handleSubmit((data) => {
              submitData = data;
            })}
          >
            submit
          </button>
        </div>
      );
    };

    render(<Component />);

    await actComponent(async () => {
      await fireEvent.click(screen.getByRole('button', { name: 'change' }));
    });

    await actComponent(async () => {
      await fireEvent.click(screen.getByRole('button', { name: 'submit' }));
    });

    expect(submitData).toEqual({
      test: 'changed',
    });
  });

  it('should validate the input and return correct isValid formState', async () => {
    const { result } = renderHook(() =>
      useForm<{ test: { data: string; data1: string } }>({
        mode: VALIDATION_MODE.onChange,
      }),
    );

    result.current.formState.isValid;

    await act(async () => {
      await result.current.register('test.data', { required: true });
      await result.current.register('test.data1', { required: true });
    });

    await act(async () => {
      await result.current.trigger();
    });

    await act(async () => {
      result.current.setValue('test.data', 'test', { shouldValidate: true });
    });

    expect(result.current.formState.isValid).toBeFalsy();

    await act(async () => {
      await result.current.setValue('test.data1', 'test', {
        shouldValidate: true,
      });
    });

    expect(result.current.formState.isValid).toBeTruthy();
  });
});
