import * as React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import {
  render,
  fireEvent,
  waitFor,
  act as actComponent,
  screen,
} from '@testing-library/react';
import { useForm } from './';
import attachEventListeners from './logic/attachEventListeners';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import validateField from './logic/validateField';
import onDomRemove from './utils/onDomRemove';
import { VALIDATION_MODE, EVENTS } from './constants';
import {
  NestedValue,
  UseFormMethods,
  Ref,
  ErrorOption,
  FieldError,
} from './types/form';
import skipValidation from './logic/skipValidation';
import * as shouldRenderBasedOnError from './logic/shouldRenderBasedOnError';
import { transformToNestObject } from './logic';
import * as focusOnErrorField from './logic/focusOnErrorField';
import * as isSameError from './utils/isSameError';
import * as getFieldValue from './logic/getFieldValue';
import { DeepMap } from './types/utils';

jest.mock('./utils/onDomRemove');
jest.mock('./logic/findRemovedFieldAndRemoveListener');
jest.mock('./logic/validateField');
jest.mock('./logic/skipValidation');
jest.mock('./logic/attachEventListeners');
jest.mock('./logic/transformToNestObject');

let nodeEnv: any;

describe('useForm', () => {
  beforeEach(() => {
    nodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    jest.resetAllMocks();
    jest.restoreAllMocks();
    (transformToNestObject as any).mockImplementation((data: any) => data);
  });

  afterEach(() => {
    process.env.NODE_ENV = nodeEnv;
  });

  describe('register', () => {
    it('should return undefined when ref is defined', () => {
      const { result } = renderHook(() => useForm());

      expect(result.current.register(undefined as any)).toBeDefined();
    });

    it('should return undefined when ref name is missing', () => {
      const { result } = renderHook(() => useForm());

      expect(
        result.current.register({ name: 'test', type: 'input' }, {}),
      ).toBeUndefined();
    });

    it('should call console.worn when ref name is undefined', () => {
      const mockConsoleWarn = spyOn(console, 'warn');
      const Component = () => {
        const { register } = useForm();
        return <input ref={register} />;
      };
      render(<Component />);

      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    test.each([['text'], ['radio'], ['checkbox']])(
      'should register field for %s type and call attachEventListeners method',
      (type) => {
        const { result } = renderHook(() => useForm());

        result.current.register({ type, name: 'test' });

        expect(attachEventListeners).toHaveBeenCalledWith({
          field: {
            mutationWatcher: undefined,
            ref: {
              type,
              name: 'test',
            },
          },
          isRadioOrCheckbox: type === 'radio' || type === 'checkbox',
          handleChange: expect.any(Function),
        });
        expect(onDomRemove).toBeCalledWith(
          { type, name: 'test' },
          expect.any(Function),
        );
      },
    );

    it('should call removeFieldEventListenerAndRef when onDomRemove method is executed', () => {
      let mockOnDetachCallback: VoidFunction;
      (onDomRemove as any).mockImplementation(
        (_: Ref, onDetachCallback: VoidFunction) => {
          mockOnDetachCallback = onDetachCallback;
        },
      );

      const { result } = renderHook(() =>
        useForm({ defaultValues: { test: 'test' } }),
      );

      result.current.register({ type: 'text', name: 'test' });

      act(() => mockOnDetachCallback());

      expect(findRemovedFieldAndRemoveListener).toHaveBeenCalled();
    });

    it('should call reRender method with removeFieldEventListenerAndRef when onDomRemove method is executed with ReactNative', () => {
      let mockOnDetachCallback: VoidFunction;
      (onDomRemove as any).mockImplementation(
        (_: Ref, onDetachCallback: VoidFunction) => {
          mockOnDetachCallback = onDetachCallback;
        },
      );

      let renderCount = 0;
      const Component = () => {
        const { register, control } = useForm();
        renderCount++;
        if (!control.readFormStateRef.current.touched) {
          control.readFormStateRef.current.touched = true;
        }
        return <input name="test" ref={register} />;
      };

      render(<Component />);

      actComponent(() => mockOnDetachCallback());

      expect(findRemovedFieldAndRemoveListener).toHaveBeenCalled();
      expect(renderCount).toBe(2);
    });

    it('should support register passed to ref', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register({ required: true })!({
        type: 'text',
        name: 'test',
        value: 'testData',
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: 'testData',
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should not register the same radio input', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      const { register } = result.current;
      register({ type: 'radio', name: 'test', value: '' });
      register({ type: 'radio', name: 'test', value: '' });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: '',
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should not register the same checkbox input', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());
      const ref = document.createElement('INPUT');
      ref.setAttribute('name', 'test');
      ref.setAttribute('type', 'checkbox');

      const { register } = result.current;
      register(ref as any);
      register(ref as any);

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: false,
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should re-render if errors ocurred with resolver with SSR', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            test: {
              type: 'test',
            },
          },
        };
      };

      let renderCount = 0;
      const Component = () => {
        const { register, control } = useForm<{ test: string }>({
          resolver,
        });

        if (!control.readFormStateRef.current.isValid) {
          control.readFormStateRef.current.isValid = true;
        }

        renderCount++;

        return (
          <div>
            <input name="test" ref={register} />
          </div>
        );
      };

      render(<Component />);

      await waitFor(() => expect(renderCount).toBe(2));
    });

    it('react native - allow registration as part of the register call', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register({ name: 'test' });

      result.current.setValue('test', '1');

      (validateField as any).mockImplementation(async () => {
        return {};
      });

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

    it('should be set default value from unmountFieldsStateRef', () => {
      const { result } = renderHook(() => useForm());
      result.current.control.unmountFieldsStateRef.current['test'] = 'value';

      result.current.register('test');

      expect(result.current.control.fieldsRef.current['test']?.ref).toEqual({
        name: 'test',
        value: 'value',
      });
    });
  });

  describe('unregister', () => {
    it('should unregister an registered item', async () => {
      const { result } = renderHook(() => useForm());

      result.current.register({ name: 'input' });
      result.current.unregister('input');

      const callback = jest.fn();

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });

      expect(findRemovedFieldAndRemoveListener).toBeCalled();
    });

    it('should unregister an registered item with array name', async () => {
      const { result } = renderHook(() => useForm());

      result.current.register({ name: 'input' });
      result.current.unregister(['input']);

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        await result.current.handleSubmit((data) => expect(data).toEqual({}))({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });

      expect(findRemovedFieldAndRemoveListener).toBeCalled();
    });

    it('should not call findRemovedFieldAndRemoveListener when field variable does not exist', () => {
      const { result } = renderHook(() => useForm());

      result.current.unregister('test');

      expect(findRemovedFieldAndRemoveListener).not.toHaveBeenCalled();
    });
  });

  describe('watch', () => {
    it('should watch individual input', () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      expect(result.current.watch('test')).toBeUndefined();

      result.current.register({ type: 'radio', name: 'test', value: 'data' });

      expect(result.current.control.watchFieldsRef).toEqual({
        current: new Set(['test']),
      });
    });

    it('should return default value if value is empty', () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      expect(result.current.watch('test', 'default')).toBe('default');
    });

    it('should watch array of inputs', () => {
      const { result } = renderHook(() =>
        useForm<{ test: string; test1: string }>(),
      );

      expect(result.current.watch(['test', 'test1'])).toEqual({
        test: undefined,
        test1: undefined,
      });

      result.current.register({
        type: 'radio',
        name: 'test',
        value: 'data1',
        checked: true,
      });
      result.current.register({
        type: 'radio',
        name: 'test1',
        value: 'data2',
        checked: true,
      });

      expect(result.current.control.watchFieldsRef).toEqual({
        current: new Set(['test', 'test1']),
      });
      expect(result.current.watch(['test', 'test1'])).toEqual({
        test: 'data1',
        test1: 'data2',
      });
    });

    it('should watch every fields', () => {
      const { result } = renderHook(() =>
        useForm<{ test: string; test1: string }>(),
      );

      result.current.register({ type: 'radio', name: 'test', value: '' });
      result.current.register({ type: 'radio', name: 'test1', value: '' });

      expect(result.current.watch()).toEqual({ test: '', test1: '' });
      expect(result.current.control.isWatchAllRef.current).toBeTruthy();
    });
  });

  describe('watchInternal', () => {
    const tests: [
      string,
      [string | string[] | undefined, unknown | undefined, string | undefined],
      {
        watchValue?: unknown;
        watchFieldsHookRef: string[];
        watchFieldsRef: string[];
        isWatchAllRef: boolean;
      },
    ][] = [
      [
        'should set value to watchFieldsHookRef if id is defined',
        ['test', undefined, 'id'],
        {
          watchValue: undefined,
          watchFieldsHookRef: ['test'],
          watchFieldsRef: [],
          isWatchAllRef: false,
        },
      ],
      [
        'should return default value if fields are undefined',
        [undefined, { test: 'default', test1: 'default1' }, 'id'],
        {
          watchValue: { test: 'default', test1: 'default1' },
          watchFieldsHookRef: [],
          watchFieldsRef: [],
          isWatchAllRef: false,
        },
      ],
      [
        'should set value to watchFieldsRef if id are undefined',
        ['test', undefined, undefined],
        {
          watchValue: undefined,
          watchFieldsHookRef: [],
          watchFieldsRef: ['test'],
          isWatchAllRef: false,
        },
      ],
      [
        'should set true to isWatchAllRef if id and fields are undefined',
        [undefined, { test: 'default', test1: 'default1' }, undefined],
        {
          watchValue: { test: 'default', test1: 'default1' },
          watchFieldsHookRef: [],
          watchFieldsRef: [],
          isWatchAllRef: true,
        },
      ],
    ];

    test.each(tests)('%s', (_, args, output) => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      const id = args[2];
      if (id) {
        result.current.control.watchFieldsHookRef.current[id] = new Set();
      }

      expect(result.current.control.watchInternal(...args)).toEqual(
        output.watchValue,
      );

      if (id) {
        expect(result.current.control.watchFieldsHookRef.current[id]).toEqual(
          new Set(output.watchFieldsHookRef),
        );
      }

      expect(result.current.control.isWatchAllRef.current).toBe(
        output.isWatchAllRef,
      );
      expect(result.current.control.watchFieldsRef.current).toEqual(
        new Set(output.watchFieldsRef),
      );
    });
  });

  describe('reset', () => {
    it('should reset the form and re-render the form', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register({ name: 'test' });
      result.current.setValue('test', 'data');

      (validateField as any).mockImplementation(async () => ({}));

      expect(result.current.formState.isSubmitted).toBeFalsy();
      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: 'data',
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });

      expect(result.current.formState.isSubmitted).toBeTruthy();
      act(() => result.current.reset());
      expect(result.current.formState.isSubmitted).toBeFalsy();
    });

    it('should reset the form if ref is HTMLElement and parent element is form', () => {
      const mockReset = jest.spyOn(window.HTMLFormElement.prototype, 'reset');
      let methods: UseFormMethods;
      const Component = () => {
        methods = useForm();
        return (
          <form>
            <input name="test" ref={methods.register} />
          </form>
        );
      };
      render(<Component />);

      actComponent(() => methods.reset());

      expect(mockReset).toHaveBeenCalled();
    });

    it('should reset the form if ref is HTMLElement and parent element is not form', () => {
      const mockReset = jest.spyOn(window.HTMLFormElement.prototype, 'reset');
      let methods: UseFormMethods;
      const Component = () => {
        methods = useForm();
        return <input name="test" ref={methods.register} />;
      };
      render(<Component />);

      actComponent(() => methods.reset());

      expect(mockReset).not.toHaveBeenCalled();
    });

    it('should set default value if values is specified to first argument', () => {
      const { result } = renderHook(() => useForm());

      result.current.register('test');

      act(() => result.current.reset({ test: 'test' }));

      expect(result.current.control.defaultValuesRef.current).toEqual({
        test: 'test',
      });
    });

    it('should execute resetFieldArrayFunctionRef if resetFieldArrayFunctionRef is exist', () => {
      const { result } = renderHook(() => useForm());
      const reset = jest.fn();
      result.current.control.resetFieldArrayFunctionRef.current['test'] = reset;

      result.current.register('test');

      act(() => result.current.reset({ test: 'test' }));

      expect(reset).toHaveBeenCalled();
    });

    it('should not reset if OmitResetState is specified', () => {
      const { result } = renderHook(() => useForm());

      result.current.register('test');

      result.current.control.errorsRef.current = { test: 'test' };
      result.current.control.touchedFieldsRef.current = { test: 'test' };
      result.current.control.validFieldsRef.current = new Set(['test']);
      result.current.control.fieldsWithValidationRef.current = new Set([
        'test',
      ]);
      result.current.control.isDirtyRef.current = true;
      result.current.control.isSubmittedRef.current = true;

      act(() =>
        result.current.reset(
          { test: '' },
          {
            errors: true,
            isDirty: true,
            isSubmitted: true,
            touched: true,
            isValid: true,
            submitCount: true,
            dirtyFields: true,
          },
        ),
      );

      expect(result.current.control.errorsRef.current).toEqual({
        test: 'test',
      });
      expect(result.current.control.touchedFieldsRef.current).toEqual({
        test: 'test',
      });
      expect(result.current.control.validFieldsRef.current).toEqual(
        new Set(['test']),
      );
      expect(result.current.control.fieldsWithValidationRef.current).toEqual(
        new Set(['test']),
      );
      expect(result.current.control.isDirtyRef.current).toBeTruthy();
      expect(result.current.control.isSubmittedRef.current).toBeTruthy();
    });

    it('should reset the unmounted input values', () => {
      const { result } = renderHook(() => useForm());

      act(() => result.current.reset({ test: 'test' }));

      expect(result.current.control.unmountFieldsStateRef.current).toEqual({
        test: 'test',
      });
    });
  });

  describe('setValue', () => {
    it('should set value of radio input correctly', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register({ name: 'test', type: 'radio', value: '1' });
      result.current.register({ name: 'test', type: 'radio', value: '2' });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

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

      result.current.register({ name: 'test', type: 'file', value: '' });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      const blob = new Blob([''], { type: 'image/png' }) as any;
      blob['lastModifiedDate'] = '';
      blob['name'] = 'filename';
      const file = blob as File;
      // @ts-ignore
      const fileList: FileList = {
        0: file,
        1: file,
        length: 2,
        item: () => file,
      };

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

    it('should set value of file input correctly if value is string', () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register({ name: 'test', type: 'file', value: '' });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      result.current.setValue('test', 'path');

      expect(
        result.current.control.fieldsRef.current['test']?.ref.value,
      ).toEqual('path');
    });

    it('should set value of multiple checkbox input correctly', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register({
        name: 'test',
        type: 'checkbox',
        value: '1',
        attributes: { value: '1' },
      });
      result.current.register({
        name: 'test',
        type: 'checkbox',
        value: '2',
        attributes: { value: '2' },
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      result.current.setValue('test', '1');

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

      result.current.register({
        name: 'test',
        type: 'checkbox',
        value: '1',
        attributes: { value: '1' },
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

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
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register({
        name: 'test',
        type: 'select-multiple',
        value: '1',
        options: [{ value: '1', selected: true }] as any,
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      result.current.setValue('test', '1');

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
        ref: { name: 'test1', value: ['1', '2', '3'] },
      });
      expect(result.current.control.fieldsRef.current['test2']).toEqual({
        ref: { name: 'test2', value: { key1: '1', key2: 2 } },
      });
      expect(result.current.control.fieldsRef.current['test3']).toEqual({
        ref: {
          name: 'test3',
          value: [
            { key1: '1', key2: 2 },
            { key1: '3', key2: 4 },
          ],
        },
      });
    });

    it('should work with array fields', () => {
      const { result } = renderHook(() => useForm());

      result.current.register('test1[0].test');
      result.current.register('test[0]');
      result.current.register('test[1]');
      result.current.register('test[2]');

      act(() => result.current.setValue('test', ['1', '2', '3']));

      expect(result.current.control.fieldsRef.current['test[0]']).toEqual({
        ref: { name: 'test[0]', value: '1' },
      });
      expect(result.current.control.fieldsRef.current['test[1]']).toEqual({
        ref: { name: 'test[1]', value: '2' },
      });
      expect(result.current.control.fieldsRef.current['test[2]']).toEqual({
        ref: { name: 'test[2]', value: '3' },
      });
    });

    it('should worked with nested array fields with object', () => {
      const { result } = renderHook(() => useForm());

      result.current.register('test[0].test');
      result.current.register('test[1].test');
      result.current.register('test[2].test');

      act(() =>
        result.current.setValue('test', [
          { test: '1' },
          { test: '2' },
          { test: '3' },
        ]),
      );

      expect(result.current.control.fieldsRef.current['test[0].test']).toEqual({
        ref: { name: 'test[0].test', value: '1' },
      });
      expect(result.current.control.fieldsRef.current['test[1].test']).toEqual({
        ref: { name: 'test[1].test', value: '2' },
      });
      expect(result.current.control.fieldsRef.current['test[2].test']).toEqual({
        ref: { name: 'test[2].test', value: '3' },
      });
    });

    it('should work with object fields', () => {
      const { result } = renderHook(() => useForm());

      result.current.register('test1[0].test');
      result.current.register('test.bill');
      result.current.register('test.luo');
      result.current.register('test.test');

      act(() =>
        result.current.setValue('test', { bill: '1', luo: '2', test: '3' }),
      );
      expect(result.current.control.fieldsRef.current['test.bill']).toEqual({
        ref: { name: 'test.bill', value: '1' },
      });
      expect(result.current.control.fieldsRef.current['test.luo']).toEqual({
        ref: { name: 'test.luo', value: '2' },
      });
      expect(result.current.control.fieldsRef.current['test.test']).toEqual({
        ref: { name: 'test.test', value: '3' },
      });
    });

    it('should be called trigger method if shouldValidate variable is true', () => {
      (validateField as any).mockImplementation(async () => ({}));
      const mockGetFieldValue = jest.spyOn(getFieldValue, 'default');

      const { result } = renderHook(() =>
        useForm({
          defaultValues: {
            test: '',
          },
        }),
      );

      result.current.register({ name: 'test', required: 'required' });
      result.current.control.readFormStateRef.current.isDirty = true;

      act(() =>
        result.current.setValue('test', 'test', {
          shouldValidate: true,
          shouldDirty: true,
        }),
      );

      expect(mockGetFieldValue).toHaveBeenCalledTimes(1);
      expect(validateField).toHaveBeenCalled();
    });

    it('should not be called trigger method if config is empty', () => {
      (validateField as any).mockImplementation(async () => ({}));
      const mockGetFieldValue = jest.spyOn(getFieldValue, 'default');

      const { result } = renderHook(() =>
        useForm({
          defaultValues: {
            test: '',
          },
        }),
      );

      result.current.register({ name: 'test', required: 'required' }),
        (result.current.control.readFormStateRef.current.isDirty = true);

      result.current.setValue('test', 'test');

      expect(mockGetFieldValue).not.toHaveBeenCalled();
      expect(validateField).not.toHaveBeenCalled();
    });

    it('should be called trigger method if shouldValidate variable is true and field value is array', async () => {
      (validateField as any).mockImplementation(() => ({}));
      const mockGetFieldValue = jest.spyOn(getFieldValue, 'default');

      const { result } = renderHook(() =>
        useForm({
          defaultValues: {
            'test[0]': '',
            'test[1]': '',
            'test[2]': '',
          },
        }),
      );

      result.current.register({ name: 'test[0]', required: 'required' });
      result.current.register({ name: 'test[1]', required: 'required' });
      result.current.register({ name: 'test[2]', required: 'required' });
      result.current.control.readFormStateRef.current.isDirty = true;

      act(() =>
        result.current.setValue('test', ['test', 'test1', 'test2'], {
          shouldValidate: true,
          shouldDirty: true,
        }),
      );

      expect(mockGetFieldValue).toHaveBeenCalledTimes(3);
      expect(validateField).toHaveBeenCalledTimes(3);
    });

    it('should not be called trigger method if config is empty and field value is array', () => {
      (validateField as any).mockImplementation(async () => ({}));
      const mockGetFieldValue = jest.spyOn(getFieldValue, 'default');

      const { result } = renderHook(() =>
        useForm({
          defaultValues: {
            'test[0]': '',
            'test[1]': '',
            'test[2]': '',
          },
        }),
      );

      result.current.register({ name: 'test[0]', required: 'required' });
      result.current.register({ name: 'test[1]', required: 'required' });
      result.current.register({ name: 'test[2]', required: 'required' });
      result.current.control.readFormStateRef.current.isDirty = true;

      act(() => result.current.setValue('test', ['test', 'test1', 'test2']));

      expect(mockGetFieldValue).not.toHaveBeenCalled();
      expect(validateField).not.toHaveBeenCalled();
    });

    it('should not work if field is not registered', () => {
      const { result } = renderHook(() => useForm());

      result.current.setValue('test', '1');

      expect(result.current.control.fieldsRef.current['test']).toBeUndefined();
    });

    describe('setDirty', () => {
      it('should set name to dirtyFieldRef if field value is different with default value with ReactNative', () => {
        const { result } = renderHook(() =>
          useForm<{ test: string }>({
            defaultValues: { test: 'default' },
          }),
        );
        result.current.control.readFormStateRef.current.dirtyFields = true;

        result.current.register('test');

        act(() => result.current.setValue('test', '1', { shouldDirty: true }));

        expect(transformToNestObject).not.toHaveBeenCalled();
        expect(result.current.formState.dirtyFields.test).toBeTruthy();
      });

      it('should set name to dirtyFieldRef if field value is different with default value and isDirty is true', () => {
        const { result } = renderHook(() =>
          useForm<{ test: string }>({
            defaultValues: { test: 'default' },
          }),
        );
        result.current.control.readFormStateRef.current.isDirty = true;

        result.current.register('test');

        result.current.setValue('test', '1');

        expect(transformToNestObject).not.toHaveBeenCalled();
        expect(result.current.formState.dirtyFields.test).toBeFalsy();
      });

      it('should set name to dirtyFieldRef if field value is different with default value and isDirty is true', () => {
        const { result } = renderHook(() =>
          useForm<{ test: string }>({
            defaultValues: { test: 'default' },
          }),
        );
        result.current.control.readFormStateRef.current.isDirty = true;

        result.current.register('test');

        act(() => result.current.setValue('test', '1', { shouldDirty: true }));

        expect(transformToNestObject).not.toHaveBeenCalled();
        expect(result.current.formState.dirtyFields.test).toBeTruthy();
      });

      it('should unset name from dirtyFieldRef if field value is not different with default value with ReactNative', () => {
        const { result } = renderHook(() =>
          useForm<{ test: string }>({
            defaultValues: { test: 'default' },
          }),
        );
        result.current.control.readFormStateRef.current.dirtyFields = true;

        result.current.register('test');

        result.current.setValue('test', '1');
        result.current.setValue('test', 'default');

        expect(transformToNestObject).not.toHaveBeenCalled();
        expect(result.current.formState.dirtyFields.test).toBeUndefined();
      });

      it('should set name to dirtyFieldRef if array field values are different with default value with ReactNative', () => {
        (transformToNestObject as any).mockReturnValue({
          test: [
            { name: 'default_update' },
            { name: 'default1' },
            { name: 'default2' },
          ],
        });

        const { result } = renderHook(() =>
          useForm({
            defaultValues: {
              test: [
                { name: 'default' },
                { name: 'default1' },
                { name: 'default2' },
              ],
            },
          }),
        );
        result.current.control.readFormStateRef.current.dirtyFields = true;
        result.current.control.fieldArrayNamesRef.current.add('test');

        result.current.register('test[0].name');
        result.current.register('test[1].name');
        result.current.register('test[2].name');

        act(() => {
          result.current.setValue(
            'test',
            [
              { name: 'default_update' },
              { name: 'default1' },
              { name: 'default2' },
            ],
            { shouldDirty: true },
          );
        });

        expect((transformToNestObject as any).mock.calls[2]).toEqual([
          {
            'test[0].name': 'default_update',
            'test[1].name': 'default1',
            'test[2].name': 'default2',
          },
        ]);
        expect(result.current.formState.dirtyFields.test!).toEqual([
          { name: true },
        ]);
      });

      it('should unset name from dirtyFieldRef if array field values are not different with default value with ReactNative', () => {
        const { result } = renderHook(() =>
          useForm({
            defaultValues: {
              test: [
                { name: 'default' },
                { name: 'default1' },
                { name: 'default2' },
              ],
            },
          }),
        );
        result.current.control.readFormStateRef.current.dirtyFields = true;
        result.current.control.fieldArrayNamesRef.current.add('test');

        result.current.register('test[0].name');
        result.current.register('test[1].name');
        result.current.register('test[2].name');

        (transformToNestObject as any).mockReturnValue({
          test: [
            { name: 'default_update' },
            { name: 'default1' },
            { name: 'default2' },
          ],
        });
        act(() => {
          result.current.setValue(
            'test',
            [
              { name: 'default_update' },
              { name: 'default1' },
              { name: 'default2' },
            ],
            { shouldDirty: true },
          );
        });

        (transformToNestObject as any).mockReturnValue({
          test: [
            { name: 'default' },
            { name: 'default1' },
            { name: 'default2' },
          ],
        });
        act(() => {
          result.current.setValue(
            'test',
            [{ name: 'default' }, { name: 'default1' }, { name: 'default2' }],
            { shouldDirty: true },
          );
        });

        expect((transformToNestObject as any).mock.calls[2]).toEqual([
          {
            'test[0].name': 'default_update',
            'test[1].name': 'default1',
            'test[2].name': 'default2',
          },
        ]);
        expect((transformToNestObject as any).mock.calls[5]).toEqual([
          {
            'test[0].name': 'default',
            'test[1].name': 'default1',
            'test[2].name': 'default2',
          },
        ]);
        expect(result.current.formState.dirtyFields?.test).toBeUndefined();
      });
    });

    it('should set unmounted input value when field is not found', () => {
      const { result } = renderHook(() => useForm());

      result.current.setValue('test', 'data');

      expect(result.current.control.unmountFieldsStateRef.current).toEqual({
        test: 'data',
      });
    });
  });

  describe('trigger', () => {
    it('should return false when field is not found', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());
      expect(await result.current.trigger('test')).toBeFalsy();
    });

    it('should return true when field is found and validation pass', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register({ type: 'input', name: 'test' });

      (validateField as any).mockImplementation(async () => ({}));

      expect(await result.current.trigger('test')).toBeTruthy();
    });

    it('should update value when value is supplied', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onChange,
        }),
      );

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      result.current.register(
        { type: 'input', name: 'test' },
        { required: true },
      );

      await act(async () =>
        expect(await result.current.trigger('test')).toBeTruthy(),
      );
    });

    it('should trigger multiple fields validation', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string; test1: string }>({
          mode: VALIDATION_MODE.onChange,
        }),
      );

      (validateField as any).mockImplementation(async () => ({}));

      result.current.register({
        name: 'test',
      });
      result.current.register({
        name: 'test1',
      });

      await act(async () => {
        await result.current.trigger(['test', 'test1'] as any);
      });

      expect(validateField).toBeCalledWith(
        {
          current: {
            test: { ref: { name: 'test' } },
            test1: { ref: { name: 'test1' } },
          },
        },
        false,
        { ref: { name: 'test' } },
        { current: {} },
      );
      expect(validateField).toBeCalledWith(
        {
          current: {
            test: { ref: { name: 'test' } },
            test1: { ref: { name: 'test1' } },
          },
        },
        false,
        { ref: { name: 'test1' } },
        { current: {} },
      );
    });
  });

  describe('trigger with schema', () => {
    it('should return the error with single field validation', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            test: {
              type: 'test',
            },
          },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onChange,
          resolver,
        }),
      );

      result.current.register(
        { type: 'input', name: 'test' },
        { required: true },
      );

      await act(async () => {
        await result.current.trigger('test');
      });
      expect(result.current.errors).toEqual({ test: { type: 'test' } });
    });

    it('should return the status of the requested field with single field validation', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            test2: {
              type: 'test',
            },
          },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test1: string; test2: string }>({
          mode: VALIDATION_MODE.onChange,
          resolver,
        }),
      );

      result.current.register(
        { type: 'input', name: 'test1' },
        { required: false },
      );
      result.current.register(
        { type: 'input', name: 'test2' },
        { required: true },
      );

      await act(async () =>
        expect(await result.current.trigger('test2')).toBeFalsy(),
      );

      expect(result.current.errors).toEqual({
        test2: {
          type: 'test',
        },
      });
    });

    it('should not trigger any error when schema validation result not found', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            value: {
              type: 'test',
            },
          },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onChange,
          // @ts-ignore
          resolver,
        }),
      );

      result.current.register(
        { type: 'input', name: 'test' },
        { required: true },
      );

      await act(async () => {
        await result.current.trigger('test');
      });

      expect(result.current.errors).toEqual({});
    });

    it('should support array of fields for schema validation', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            test1: {
              type: 'test1',
            },
            test: {
              type: 'test',
            },
          },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string; test1: string }>({
          mode: VALIDATION_MODE.onChange,
          resolver,
        }),
      );

      result.current.register(
        { type: 'input', name: 'test' },
        { required: true },
      );

      await act(async () => {
        await result.current.trigger(['test', 'test1']);
      });

      expect(result.current.errors).toEqual({
        test1: {
          type: 'test1',
        },
        test: {
          type: 'test',
        },
      });
    });

    it('should return the status of the requested fields with array of fields for validation', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: { test3: 'test3' },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test1: string; test2: string; test3: string }>({
          mode: VALIDATION_MODE.onChange,
          // @ts-ignore
          resolver,
        }),
      );

      result.current.register(
        { type: 'input', name: 'test1' },
        { required: false },
      );
      result.current.register(
        { type: 'input', name: 'test2' },
        { required: false },
      );
      result.current.register(
        { type: 'input', name: 'test3' },
        { required: true },
      );

      await act(async () =>
        expect(await result.current.trigger(['test1', 'test2'])).toBeTruthy(),
      );
    });

    it('should validate all fields when pass with undefined', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            test1: {
              type: 'test1',
            },
            test: {
              type: 'test',
            },
          },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test1: string; test: string }>({
          mode: VALIDATION_MODE.onChange,
          resolver,
        }),
      );

      result.current.register(
        { type: 'input', name: 'test' },
        { required: true },
      );
      result.current.register(
        { type: 'input', name: 'test1' },
        { required: true },
      );

      await act(async () => {
        await result.current.trigger();
      });

      expect(result.current.errors).toEqual({
        test1: {
          type: 'test1',
        },
        test: {
          type: 'test',
        },
      });
    });
  });

  describe('handleSubmit', () => {
    it('should invoke the callback when validation pass', async () => {
      const { result } = renderHook(() => useForm());
      const callback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(callback).toBeCalled();
    });

    it('should invoke reRender method when readFormStateRef.current.isSubmitting is true', async () => {
      let renderCount = 0;
      const Component = () => {
        const { register, handleSubmit, formState } = useForm();
        renderCount++;
        return (
          <div>
            <input name="test" ref={register} />
            <button onClick={handleSubmit(() => {})}></button>
            <span role="alert">
              {formState.isSubmitting ? 'true' : 'false'}
            </span>
          </div>
        );
      };

      render(<Component />);
      (validateField as any).mockImplementation(async () => ({}));

      fireEvent.click(screen.getByRole('button'));

      const span = screen.getByRole('alert')!;
      await waitFor(
        () => {
          if (renderCount === 2) {
            expect(span.textContent).toBe('true');
          } else {
            expect(span.textContent).toBe('false');
          }
        },
        { container: span },
      );

      await waitFor(() => {
        expect(renderCount).toBe(4);
      });
    });

    it('should not invoke callback when there are errors', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register(
        { value: '', type: 'input', name: 'test' },
        { required: true },
      );

      const callback = jest.fn();
      (validateField as any).mockImplementation(async () => {
        return { test: { type: 'test' } };
      });

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(callback).not.toBeCalled();
    });

    it('should not focus if shouldFocusError is false', async () => {
      const errors = {
        test: {
          type: 'required',
          ref: { name: 'test', value: '' },
          types: {
            required: 'required',
          },
          message: 'required',
        },
      };
      (validateField as any).mockImplementation(async () => {
        return errors;
      });
      const mockFocusOnErrorField = jest.spyOn(focusOnErrorField, 'default');

      const { result } = renderHook(() => useForm({ shouldFocusError: false }));

      result.current.register('test', { required: true });

      const callback = jest.fn();
      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });

      expect(callback).not.toBeCalled();
      expect(mockFocusOnErrorField).not.toBeCalled();
      expect(result.current.control.errorsRef.current).toEqual(errors);
    });
  });

  describe('handleSubmit with validationSchema', () => {
    it('should invoke callback when error not found', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {},
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onSubmit,
          resolver,
        }),
      );

      result.current.register(
        { value: '', type: 'input', name: 'test' },
        { required: true },
      );

      const callback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(callback).toBeCalled();
    });

    it('should invoke callback with transformed values', async () => {
      const resolver = async () => {
        return {
          values: { test: 'test' },
          errors: {},
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onSubmit,
          resolver,
        }),
      );

      result.current.register(
        { value: '', type: 'input', name: 'test' },
        { required: true },
      );

      const callback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(callback.mock.calls[0][0]).toEqual({ test: 'test' });
    });
  });

  describe('getValues', () => {
    it('should call getFieldsValues and return all values', () => {
      const { result } = renderHook(() => useForm<{ test: string }>());
      result.current.register({ value: 'test', type: 'input', name: 'test' });
      expect(result.current.getValues()).toEqual({ test: 'test' });
    });

    it('should get individual field value', () => {
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          defaultValues: {
            test: '123',
          },
        }),
      );
      result.current.register({ type: 'input', name: 'test' });
      expect(result.current.getValues('test')).toEqual('123');
    });

    it('should get all field values', () => {
      const values = {
        test: 'test',
        test1: 'test1',
        test2: 'test2',
      };
      const { result } = renderHook(() =>
        useForm<{ test: string; test1: string; test2: string }>({
          defaultValues: values,
        }),
      );
      result.current.register({ type: 'input', name: 'test' });
      result.current.register({ type: 'input', name: 'test1' });
      result.current.register({ type: 'input', name: 'test2' });
      expect(result.current.getValues(['test', 'test1', 'test2'])).toEqual(
        values,
      );
    });

    it('should get undefined when field not found', () => {
      const { result } = renderHook(() => useForm());

      expect(result.current.getValues('test')).toEqual(undefined);
    });
  });

  describe('setError', () => {
    const tests: [string, ErrorOption, DeepMap<any, FieldError>][] = [
      [
        'should only set an error when it is not existed',
        { type: 'test' },
        {
          input: {
            type: 'test',
            message: undefined,
            ref: undefined,
          },
        },
      ],
      [
        'should set error message',
        { type: 'test', message: 'test' },
        {
          input: {
            type: 'test',
            message: 'test',
            ref: undefined,
            types: undefined,
          },
        },
      ],
      [
        'should set multiple error type',
        {
          types: { test1: 'test1', test2: 'test2' },
        },
        {
          input: {
            types: {
              test1: 'test1',
              test2: 'test2',
            },
            ref: undefined,
          },
        },
      ],
    ];

    test.each(tests)('%s', (_, input, output) => {
      const { result } = renderHook(() => useForm<{ input: string }>());
      act(() => {
        result.current.setError('input', input);
      });
      expect(result.current.errors).toEqual(output);
      expect(result.current.formState.isValid).toBeFalsy();
    });
  });

  describe('clearErrors', () => {
    it('should remove error', () => {
      const { result } = renderHook(() => useForm<{ input: string }>());
      act(() =>
        result.current.setError('input', {
          type: 'test',
          message: 'message',
        }),
      );

      act(() => result.current.clearErrors('input'));

      expect(result.current.errors).toEqual({});
    });

    it('should remove nested error', () => {
      const { result } = renderHook(() =>
        useForm<{ input: { nested: string } }>(),
      );
      act(() =>
        result.current.setError('input.nested', {
          type: 'test',
        }),
      );
      expect(result.current.errors.input?.nested).toBeDefined();
      act(() => result.current.clearErrors('input.nested'));
      expect(result.current.errors.input?.nested).toBeUndefined();
    });

    it('should remove specified errors', () => {
      const { result } = renderHook(() =>
        useForm<{ input: string; input1: string; input2: string }>(),
      );

      const error = {
        type: 'test',
        message: 'message',
      };

      act(() => result.current.setError('input', error));
      act(() => result.current.setError('input1', error));
      act(() => result.current.setError('input2', error));

      const errors = {
        input: {
          ...error,
          ref: undefined,
          types: undefined,
        },
        input1: {
          ...error,
          ref: undefined,
          types: undefined,
        },
        input2: {
          ...error,
          ref: undefined,
          types: undefined,
        },
      };
      expect(result.current.errors).toEqual(errors);

      act(() => result.current.clearErrors(['input', 'input1']));
      expect(result.current.errors).toEqual({ input2: errors.input2 });
    });

    it('should remove all error', () => {
      const { result } = renderHook(() =>
        useForm<{ input: string; input1: string; input2: string }>(),
      );

      const error = {
        type: 'test',
        message: 'message',
      };
      act(() => result.current.setError('input', error));
      act(() => result.current.setError('input1', error));
      act(() => result.current.setError('input2', error));
      expect(result.current.errors).toEqual({
        input: {
          ...error,
          ref: undefined,
          types: undefined,
        },
        input1: {
          ...error,
          ref: undefined,
          types: undefined,
        },
        input2: {
          ...error,
          ref: undefined,
          types: undefined,
        },
      });

      act(() => result.current.clearErrors());
      expect(result.current.errors).toEqual({});
    });

    it('should prevent the submission if there is a custom error', async () => {
      const submit = jest.fn();
      const { result } = renderHook(() =>
        useForm<{ data: string; whatever: string }>(),
      );

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      result.current.register('data');

      act(() => result.current.setError('whatever', { type: 'missing' }));

      await act(async () => await result.current.handleSubmit(submit)());
      expect(submit).not.toBeCalled();

      act(() => {
        result.current.clearErrors('whatever');
      });

      await act(async () => await result.current.handleSubmit(submit)());
      expect(submit).toBeCalled();
    });
  });

  describe('formState', () => {
    it('should disable isValid for submit mode', () => {
      const { result } = renderHook(() => useForm<{ input: string }>());
      expect(result.current.formState.isValid).toBeFalsy();
    });

    it('should return true for onBlur mode by default', () => {
      const { result } = renderHook(() =>
        useForm<{ input: string }>({
          mode: VALIDATION_MODE.onBlur,
        }),
      );

      expect(result.current.formState.isValid).toBeTruthy();
    });

    it('should return true for onChange mode by default', () => {
      const { result } = renderHook(() =>
        useForm<{ input: string }>({
          mode: VALIDATION_MODE.onChange,
        }),
      );

      expect(result.current.formState.isValid).toBeTruthy();
    });

    it('should return true when no validation is registered', () => {
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onBlur,
        }),
      );

      result.current.register({ type: 'text', name: 'test' });

      expect(result.current.formState.isValid).toBeTruthy();
    });

    it('should return false when default value is not valid value', async () => {
      const { result } = renderHook(() =>
        useForm<{ input: string; issue: string }>({
          mode: VALIDATION_MODE.onChange,
        }),
      );

      (validateField as any).mockImplementation(async () => {
        return { issue: 'issue' };
      });

      result.current.formState.isValid;

      await act(async () =>
        result.current.register(
          { name: 'issue', value: 'test' },
          { required: true },
        ),
      );
      result.current.register({ name: 'input' });

      expect(result.current.formState.isValid).toBeFalsy();
    });

    it('should return true when default value meet the validation criteria', async () => {
      const { result } = renderHook(() =>
        useForm<{ input: string; issue: string }>({
          mode: VALIDATION_MODE.onChange,
        }),
      );

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      result.current.formState.isValid;

      result.current.register(
        { name: 'issue', value: 'test' },
        { required: true },
      );
      result.current.register({ name: 'input' }, { required: true });

      expect(result.current.formState.isValid).toBeTruthy();
    });

    it('should be a proxy object that returns undefined for unknown properties', () => {
      const { result } = renderHook(() => useForm());

      // @ts-ignore
      expect(result.current.formState.nonExistentProperty).toBeUndefined();
    });

    it('should be a proxy object that properly implements the has trap', () => {
      const { result } = renderHook(() => useForm());

      expect('nonExistentProperty' in result.current.formState).toBeFalsy();
    });

    it('should be a proxy object that hasOwnProperty works on', () => {
      const { result } = renderHook(() => useForm());

      expect(result.current.formState).toHaveProperty('hasOwnProperty');
    });
  });

  describe('when component unMount', () => {
    it('should call unSubscribe', () => {
      const { result, unmount } = renderHook(() => useForm<{ test: string }>());

      result.current.register({ type: 'text', name: 'test' });
      unmount();
      expect(findRemovedFieldAndRemoveListener).toBeCalled();
    });

    it('should call removeFieldEventListenerAndRef when field variable is array', () => {
      const { result, unmount } = renderHook(() => useForm());

      result.current.control.fieldArrayNamesRef.current.add('test');

      result.current.register({ type: 'text', name: 'test[0]' });
      result.current.register({ type: 'text', name: 'test[1]' });
      result.current.register({ type: 'text', name: 'test[2]' });

      unmount();

      expect(findRemovedFieldAndRemoveListener).toHaveBeenCalled();
    });

    it('should not call removeFieldEventListenerAndRef when field variable does not exist', () => {
      const { unmount } = renderHook(() => useForm());

      unmount();

      expect(findRemovedFieldAndRemoveListener).not.toHaveBeenCalled();
    });

    it('should call resolver with removeFieldEventListenerAndRef with ReactNative', () => {
      const resolver = jest.fn(async (data: any) => {
        return {
          values: data,
          errors: {},
        };
      });

      const { result, unmount } = renderHook(() =>
        useForm<{ test: string }>({ resolver }),
      );
      result.current.control.readFormStateRef.current.touched = true;

      result.current.register({ type: 'text', name: 'test' });
      unmount();
      expect(resolver).toBeCalled();
    });
  });

  describe('when defaultValues is supplied', () => {
    it('should populate the input with them', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string; deep: { nested: string; values: string } }>({
          mode: VALIDATION_MODE.onSubmit,
          defaultValues: {
            test: 'data',
            deep: {
              values: '5',
            },
          },
        }),
      );

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      result.current.register({ type: 'text', name: 'test' });
      result.current.register({ type: 'text', name: 'deep.nested' });
      result.current.register({ type: 'text', name: 'deep.values' });

      await act(async () => {
        await result.current.handleSubmit((data: any) => {
          expect(data).toEqual({
            test: 'data',
            'deep.nested': undefined,
            'deep.values': '5',
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should return undefined when inputs not yet registered', () => {
      const { result } = renderHook(() =>
        useForm({
          mode: VALIDATION_MODE.onSubmit,
          defaultValues: {
            test: 'data',
            deep: {
              values: '5',
            },
          },
        }),
      );

      const test: string = result.current.getValues().test;
      expect(test).toEqual(undefined);
      const deep: { values: string } = result.current.getValues().deep;
      expect(deep).toEqual(undefined);
    });
  });

  describe('when errors changes', () => {
    it('should display the latest error message', () => {
      const Form = () => {
        const { register, setError, errors } = useForm();

        React.useEffect(() => {
          setError('test', {
            type: 'data',
            message: 'data',
          });
        }, [setError]);

        return (
          <div>
            <input
              ref={register({
                maxLength: {
                  message: 'max',
                  value: 3,
                },
              })}
              placeholder="test"
              name="test"
              type="text"
            />
            <span role="alert">{errors.test && errors.test.message}</span>
          </div>
        );
      };

      render(<Form />);

      const span = screen.getByRole('alert');

      expect(span.textContent).toBe('data');

      fireEvent.input(screen.getByRole('textbox'), {
        target: {
          value: 'test',
        },
      });

      expect(span.textContent).toBe('data');
    });
  });

  describe('handleChangeRef', () => {
    const skipValidationParams = {
      isOnChange: false,
      hasError: false,
      isBlurEvent: false,
      isOnSubmit: false,
      isReValidateOnSubmit: false,
      isOnBlur: false,
      isReValidateOnBlur: false,
      isSubmitted: false,
    };
    const validateFieldParams = (ref: HTMLInputElement, name = 'test') => [
      {
        current: {
          [name]: {
            ref,
            required: 'required',
            mutationWatcher: undefined,
          },
        },
      },
      false,
      {
        ref,
        required: 'required',
        mutationWatcher: undefined,
      },
      { current: {} },
    ];
    const shouldRenderBasedOnErrorParams = (name = 'test') => ({
      errors: {},
      name,
      error: {},
      validFields: new Set(),
      fieldsWithValidation: new Set(),
    });
    let renderCount: number;
    let Component: React.FC<{
      name?: string;
      resolver?: any;
      mode?: 'onBlur' | 'onSubmit' | 'onChange';
    }>;
    let methods: UseFormMethods<{ test: string }>;

    beforeEach(() => {
      (attachEventListeners as any).mockImplementation(
        ({
          field: { ref },
          handleChange,
        }: {
          field: { ref: HTMLInputElement };
          handleChange?: EventListenerOrEventListenerObject;
        }) => {
          ref.addEventListener(EVENTS.INPUT, handleChange!);
          ref.addEventListener(EVENTS.BLUR, handleChange!);
        },
      );
      renderCount = 0;
      Component = ({
        name = 'test',
        resolver,
        mode,
      }: {
        name?: string;
        resolver?: any;
        mode?: 'onBlur' | 'onSubmit' | 'onChange';
      }) => {
        const internationalMethods = useForm<{ test: string }>({
          resolver,
          mode,
        });
        const { register, handleSubmit, errors } = internationalMethods;
        methods = internationalMethods;
        renderCount++;

        return (
          <div>
            <input
              type="text"
              name={name}
              ref={resolver ? register : register({ required: 'required' })}
            />
            <span role="alert">
              {errors?.test?.message && errors.test.message}
            </span>
            <button onClick={handleSubmit(() => {})}>button</button>
          </div>
        );
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('onSubmit mode', () => {
      it('should not contain error if value is valid', () => {
        (skipValidation as any).mockReturnValue(true);

        render(<Component />);

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test' },
        });

        expect(skipValidation).toHaveBeenCalledWith({
          ...skipValidationParams,
          isOnSubmit: true,
        });
        expect(validateField).not.toHaveBeenCalled();
        expect(screen.getByRole('alert').textContent).toBe('');
        expect(renderCount).toBe(1);
      });

      it('should not contain error if name is invalid', () => {
        render(<Component />);

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test1' },
        });

        expect(skipValidation).not.toHaveBeenCalled();
        expect(validateField).not.toHaveBeenCalled();
        expect(screen.getByRole('alert').textContent).toBe('');
        expect(renderCount).toBe(1);
      });

      it('should not contain error if value is valid when executed handleSubmit', async () => {
        (skipValidation as any).mockReturnValue(false);
        const mockShouldRenderBasedOnError = jest
          .spyOn(shouldRenderBasedOnError, 'default')
          .mockReturnValue(false);

        render(<Component />);

        const input = screen.getByRole('textbox') as HTMLInputElement;

        (validateField as any).mockReturnValue({});

        fireEvent.input(input, { target: { name: 'test', value: 'test' } });

        fireEvent.click(screen.getByRole('button'));

        await waitFor(() =>
          expect(skipValidation).toHaveBeenCalledWith({
            ...skipValidationParams,
            isOnSubmit: true,
          }),
        );
        expect(validateField).toHaveBeenCalledWith(
          ...validateFieldParams(input),
        );
        expect(mockShouldRenderBasedOnError).toHaveBeenCalledWith({
          ...shouldRenderBasedOnErrorParams(),
          validFields: new Set(['test']),
          fieldsWithValidation: new Set(['test']),
        });
        expect(screen.getByRole('alert').textContent).toBe('');
        expect(renderCount).toBe(3);
      });

      it('should contain error if value is invalid when value was changed', async () => {
        let input: any = null;

        const error = {
          test: {
            type: 'required',
            ref: input,
            types: {
              required: 'required',
            },
            message: 'required',
          },
        };
        (validateField as any).mockReturnValue(error);

        (skipValidation as any).mockReturnValue(false);
        const mockShouldRenderBasedOnError = jest
          .spyOn(shouldRenderBasedOnError, 'default')
          .mockReturnValue(true);

        render(<Component />);

        input = screen.getByRole('textbox');

        fireEvent.input(input, { target: { name: 'test' } });

        await waitFor(() =>
          expect(validateField).toHaveBeenCalledWith(
            ...validateFieldParams(input),
          ),
        );
        expect(skipValidation).toHaveBeenCalledWith({
          ...skipValidationParams,
          isOnSubmit: true,
        });
        expect(mockShouldRenderBasedOnError).toHaveBeenCalledWith({
          ...shouldRenderBasedOnErrorParams(),
          errors: {
            test: {
              message: 'required',
              ref: null,
              type: 'required',
              types: {
                required: 'required',
              },
            },
          },
          error,
          fieldsWithValidation: new Set(['test']),
        });
        expect(screen.getByRole('alert').textContent).toBe('required');
        expect(renderCount).toBe(2);
      });

      it('should not contain error if value is valid when value was changed', async () => {
        let input: any = null;

        const error = {
          test: {
            type: 'required',
            ref: input,
            types: {
              required: 'required',
            },
            message: 'required',
          },
        };

        (validateField as any).mockReturnValue(error);

        (skipValidation as any).mockReturnValue(false);
        const mockShouldRenderBasedOnError = jest
          .spyOn(shouldRenderBasedOnError, 'default')
          .mockReturnValue(true);

        render(<Component />);

        input = screen.getByRole('textbox');

        fireEvent.input(input, { target: { name: 'test' } });

        (validateField as any).mockReturnValue({});

        fireEvent.input(input, { target: { name: 'test' } });

        await waitFor(() =>
          expect(validateField).toHaveBeenCalledWith(
            ...validateFieldParams(input),
          ),
        );
        expect(skipValidation).toHaveBeenCalledWith({
          ...skipValidationParams,
          isOnSubmit: true,
        });

        expect(mockShouldRenderBasedOnError.mock.calls[0]).toEqual([
          {
            errors: {},
            name: 'test',
            error,
            validFields: new Set(['test']),
            fieldsWithValidation: new Set(['test']),
          },
        ]);

        expect(mockShouldRenderBasedOnError.mock.calls[1]).toEqual([
          {
            errors: {},
            name: 'test',
            error: {},
            validFields: new Set(['test']),
            fieldsWithValidation: new Set(['test']),
          },
        ]);
        expect(screen.getByRole('alert').textContent).toBe('');
        expect(renderCount).toBe(3);
      });

      it('should call reRender method if previous error is undefined', async () => {
        let input: any = null;

        const error = {
          test: {
            type: 'required',
            ref: input,
            types: {
              required: 'required',
            },
            message: 'required',
          },
        };

        const mockIsSameError = jest.spyOn(isSameError, 'default');

        (validateField as any).mockReturnValue(error);

        (skipValidation as any).mockReturnValue(false);
        const mockShouldRenderBasedOnError = jest
          .spyOn(shouldRenderBasedOnError, 'default')
          .mockReturnValue(false);

        render(<Component />);

        input = screen.getByRole('textbox');

        fireEvent.input(input, { target: { name: 'test' } });

        await waitFor(() =>
          expect(validateField).toHaveBeenCalledWith(
            ...validateFieldParams(input),
          ),
        );
        expect(skipValidation).toHaveBeenCalledWith({
          ...skipValidationParams,
          isOnSubmit: true,
        });
        expect(mockShouldRenderBasedOnError).toHaveBeenCalledWith({
          errors: error,
          name: 'test',
          error,
          validFields: new Set(),
          fieldsWithValidation: new Set(['test']),
        });
        expect(mockIsSameError).not.toBeCalled();
        expect(screen.getByRole('alert').textContent).toBe('required');
        expect(renderCount).toBe(2);
      });

      it('should not call reRender method if the current error is the same as the previous error', async () => {
        let input: any = null;

        const error = {
          test: {
            type: 'required',
            ref: input,
            types: {
              required: 'required',
            },
            message: 'required',
          },
        };

        const mockIsSameError = jest.spyOn(isSameError, 'default');

        (validateField as any).mockReturnValue(error);

        (skipValidation as any).mockReturnValue(false);
        const mockShouldRenderBasedOnError = jest
          .spyOn(shouldRenderBasedOnError, 'default')
          .mockReturnValue(false);

        render(<Component />);

        input = screen.getByRole('textbox');

        methods.control.errorsRef.current = error;

        fireEvent.input(input, { target: { name: 'test' } });

        await waitFor(() =>
          expect(validateField).toHaveBeenCalledWith(
            ...validateFieldParams(input),
          ),
        );
        expect(skipValidation).toHaveBeenCalledWith({
          ...skipValidationParams,
          isOnSubmit: true,
          hasError: true,
        });
        expect(mockShouldRenderBasedOnError).toHaveBeenCalledWith({
          errors: error,
          name: 'test',
          error,
          validFields: new Set(),
          fieldsWithValidation: new Set(['test']),
        });
        expect(mockIsSameError).toBeCalledWith(error.test, error.test);
        expect(screen.getByRole('alert').textContent).toBe('');
        expect(renderCount).toBe(1);
      });

      it('should be called reRender method if isWatchAllRef is true', () => {
        (skipValidation as any).mockReturnValue(true);

        render(<Component />);

        methods.control.isWatchAllRef.current = true;
        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test' },
        });

        expect(skipValidation).toHaveBeenCalledWith({
          ...skipValidationParams,
          isOnSubmit: true,
        });
        expect(validateField).not.toHaveBeenCalled();
        expect(screen.getByRole('alert').textContent).toBe('');
        expect(renderCount).toBe(2);
      });

      it('should be called reRender method if field is watched', () => {
        (skipValidation as any).mockReturnValue(true);

        render(<Component />);

        methods.control.watchFieldsRef.current.add('test');
        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test' },
        });

        expect(skipValidation).toHaveBeenCalledWith({
          ...skipValidationParams,
          isOnSubmit: true,
        });
        expect(validateField).not.toHaveBeenCalled();
        expect(screen.getByRole('alert').textContent).toBe('');
        expect(renderCount).toBe(2);
      });

      it('should be called reRender method if field array is watched', () => {
        (skipValidation as any).mockReturnValue(true);

        render(<Component name="test[0]" />);

        methods.control.watchFieldsRef.current.add('test');
        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test[0]' },
        });

        expect(skipValidation).toHaveBeenCalledWith({
          ...skipValidationParams,
          isOnSubmit: true,
        });
        expect(validateField).not.toHaveBeenCalled();
        expect(renderCount).toBe(2);
      });
    });

    describe('onBlur mode', () => {
      it('should not contain error if value is valid with ReactNative', async () => {
        (skipValidation as any).mockReturnValue(false);
        (validateField as any).mockReturnValue({});
        const mockShouldRenderBasedOnError = jest
          .spyOn(shouldRenderBasedOnError, 'default')
          .mockReturnValue(false);

        render(<Component mode="onBlur" />);
        methods.control.readFormStateRef.current.touched = true;

        const input = screen.getByRole('textbox') as HTMLInputElement;
        fireEvent.blur(input, { target: { name: 'test' } });

        await waitFor(() =>
          expect(skipValidation).toHaveBeenCalledWith({
            ...skipValidationParams,
            isBlurEvent: true,
            isOnBlur: true,
          }),
        );
        expect(validateField).toHaveBeenCalledWith(
          ...validateFieldParams(input),
        );
        expect(mockShouldRenderBasedOnError).toHaveBeenCalledWith({
          ...shouldRenderBasedOnErrorParams(),
          validFields: new Set(['test']),
          fieldsWithValidation: new Set(['test']),
        });
        expect(methods.control.touchedFieldsRef.current).toEqual({
          test: true,
        });
        expect(screen.getByRole('alert').textContent).toBe('');
        expect(renderCount).toBe(2);
      });
    });

    describe('onChange mode', () => {
      it('should not contain error if value is valid with ReactNative', async () => {
        (skipValidation as any).mockReturnValue(true);
        const mockShouldRenderBasedOnError = jest.spyOn(
          shouldRenderBasedOnError,
          'default',
        );

        render(<Component mode="onChange" />);
        methods.control.readFormStateRef.current.touched = true;

        fireEvent.blur(screen.getByRole('textbox'), {
          target: { name: 'test' },
        });

        await waitFor(() =>
          expect(skipValidation).toHaveBeenCalledWith({
            ...skipValidationParams,
            isOnChange: true,
            isBlurEvent: true,
          }),
        );
        expect(validateField).not.toHaveBeenCalled();
        expect(mockShouldRenderBasedOnError).not.toHaveBeenCalled();
        expect(methods.control.touchedFieldsRef.current).toEqual({
          test: true,
        });
        expect(screen.getByRole('alert').textContent).toBe('');
        expect(renderCount).toBe(2);
      });
    });

    describe('with resolver', () => {
      it('should not contain error if value is invalid with resolver', async () => {
        const resolver = jest.fn(async (data: any) => {
          return {
            values: data,
            errors: {},
          };
        });

        render(<Component resolver={resolver} />);

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test' },
        });

        await waitFor(() => expect(resolver).toHaveBeenCalled());
        expect(screen.getByRole('alert').textContent).toBe('');
        expect(renderCount).toBe(1);
      });

      it('should contain error if value is invalid with resolver', async () => {
        const resolver = jest.fn(async (data: any) => {
          return {
            values: data,
            errors: {
              test: {
                message: 'resolver error',
              },
            },
          };
        });

        render(<Component resolver={resolver} />);

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test' },
        });

        await waitFor(() => expect(resolver).toHaveBeenCalled());
        expect(screen.getByRole('alert').textContent).toBe('resolver error');
        expect(renderCount).toBe(2);
      });
    });
  });

  describe('renderWatchedInputs', () => {
    const fieldName = 'test';
    const id = 'id';

    it('should be called watchFieldsHookRenderRef if watchFieldsHookRef have field name.', () => {
      const { result } = renderHook(() => useForm());
      const {
        watchFieldsHookRef,
        watchFieldsHookRenderRef,
        renderWatchedInputs,
      } = result.current.control;

      watchFieldsHookRef.current[id] = new Set([fieldName]);
      watchFieldsHookRenderRef.current[id] = jest.fn();

      expect(renderWatchedInputs(fieldName)).toBeFalsy();
      expect(watchFieldsHookRenderRef.current[id]).toHaveBeenCalled();
    });

    it('should be called watchFieldsHookRenderRef if watchFieldsHookRef not have field name but it have id.', () => {
      const { result } = renderHook(() => useForm());
      const {
        watchFieldsHookRef,
        watchFieldsHookRenderRef,
        renderWatchedInputs,
      } = result.current.control;

      watchFieldsHookRef.current[id] = new Set();
      watchFieldsHookRenderRef.current[id] = jest.fn();

      expect(renderWatchedInputs(fieldName)).toBeFalsy();
      expect(watchFieldsHookRenderRef.current[id]).toHaveBeenCalled();
    });

    it('should be called watchFieldsHookRenderRef if fieldArrayNamesRef have field name', () => {
      const { result } = renderHook(() => useForm());
      const {
        fieldArrayNamesRef,
        watchFieldsHookRef,
        watchFieldsHookRenderRef,
        renderWatchedInputs,
      } = result.current.control;

      fieldArrayNamesRef.current.add(fieldName);
      watchFieldsHookRef.current[id] = new Set([fieldName]);
      watchFieldsHookRenderRef.current[id] = jest.fn();

      expect(renderWatchedInputs(`${fieldName}[0]`)).toBeFalsy();
      expect(watchFieldsHookRenderRef.current[id]).toHaveBeenCalled();
    });

    it("should not be called watchFieldsHookRenderRef if watchFieldsHookRef don't have field name", () => {
      const { result } = renderHook(() => useForm());
      const {
        fieldArrayNamesRef,
        watchFieldsHookRef,
        watchFieldsHookRenderRef,
        renderWatchedInputs,
      } = result.current.control;

      fieldArrayNamesRef.current.add(fieldName);
      watchFieldsHookRef.current[id] = new Set([fieldName]);
      watchFieldsHookRenderRef.current[id] = jest.fn();

      expect(renderWatchedInputs('field')).toBeTruthy();
      expect(watchFieldsHookRenderRef.current[id]).not.toHaveBeenCalled();
    });
  });

  describe('validateSchemaIsValid', () => {
    it('should be defined when resolver is defined', () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {},
        };
      };

      const { result } = renderHook(() => useForm({ resolver }));

      expect(result.current.control.validateSchemaIsValid).toBeDefined();
    });

    it('should be undefined when resolver is undefined', () => {
      const { result } = renderHook(() => useForm());

      expect(result.current.control.validateSchemaIsValid).toBeUndefined();
    });

    it('should be called resolver with default values if default value is defined', () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {},
        };
      };

      const { result } = renderHook(() =>
        useForm({
          resolver,
          defaultValues: { test: 'default' },
        }),
      );

      result.current.register('test');

      result.current.control.validateSchemaIsValid!({});

      expect(transformToNestObject).toBeCalledWith({ test: 'default' });
    });

    it('should be called resolver with field values if default value is undefined', () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {},
        };
      };

      const { result } = renderHook(() =>
        useForm({
          resolver,
        }),
      );

      result.current.register('test');

      result.current.setValue('test', 'value');

      result.current.control.validateSchemaIsValid!({});

      expect(transformToNestObject).toBeCalledWith({ test: 'value' });
    });
  });
});
