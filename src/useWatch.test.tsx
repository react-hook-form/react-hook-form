import * as React from 'react';
import { useForm } from './useForm';
import { useWatch } from './useWatch';
import generateId from './logic/generateId';
import { renderHook, act } from '@testing-library/react-hooks';
import {
  render,
  screen,
  fireEvent,
  act as actComponent,
} from '@testing-library/react';
import { reconfigureControl } from './__mocks__/reconfigureControl';
import { FormProvider } from './useFormContext';
import { useFieldArray } from './useFieldArray';
import { Control } from './types';

jest.mock('./logic/generateId');

describe('useWatch', () => {
  describe('initialize', () => {
    it('should return default value in useForm', () => {
      (generateId as any).mockReturnValue('123');
      let method: any;
      let watched: any;
      const Component = () => {
        method = useForm({ defaultValues: { test: 'test' } });
        watched = useWatch({ control: method.control });
        return <div />;
      };
      render(<Component />);

      expect(method.control.isWatchAllRef.current).toBeFalsy();
      expect(watched).toEqual({ test: 'test' });
    });

    it('should return default value in useWatch', () => {
      const { result } = renderHook(() =>
        useWatch({
          control: reconfigureControl(),
          name: 'test',
          defaultValue: 'test',
        }),
      );

      expect(result.current).toEqual('test');
    });

    it('should return default value for single input', () => {
      const { result } = renderHook(() =>
        useWatch({
          control: {
            ...reconfigureControl(),
            defaultValuesRef: {
              current: {
                test: 'test',
                test1: 'test1',
              },
            },
          },
          name: 'test',
        }),
      );

      expect(result.current).toEqual('test');
    });

    it('should return default values for array of inputs', () => {
      const { result } = renderHook(() =>
        useWatch({
          control: {
            ...reconfigureControl(),
            defaultValuesRef: {
              current: {
                test: 'test',
                test1: 'test1',
              },
            },
          },
          name: ['test', 'test1'],
        }),
      );

      expect(result.current).toEqual({ test: 'test', test1: 'test1' });
    });

    it('should return default value when name is undefined', () => {
      const { result } = renderHook(() =>
        useWatch({
          control: {
            ...reconfigureControl(),
            defaultValuesRef: {
              current: {
                test: 'test',
                test1: 'test1',
              },
            },
          },
        }),
      );

      expect(result.current).toEqual({ test: 'test', test1: 'test1' });
    });

    it('should return empty object', () => {
      const { result } = renderHook(() =>
        useWatch({
          control: reconfigureControl(),
          name: ['test'],
        }),
      );

      expect(result.current).toEqual({});
    });

    it('should return undefined', () => {
      const { result } = renderHook(() =>
        useWatch({
          control: reconfigureControl(),
          name: 'test',
        }),
      );

      expect(result.current).toBeUndefined();
    });

    it('should invoked generateId and set up watchFieldsHook and watchFieldsHookRender after mount', () => {
      (generateId as any).mockImplementation(() => {
        return '123';
      });
      const watchFieldsHookRenderRef = {
        current: {},
      };
      const watchFieldsHookRef = {
        current: {},
      };
      renderHook(() =>
        useWatch({
          control: {
            ...reconfigureControl(),
            watchFieldsHookRenderRef,
            watchFieldsHookRef,
          },
          name: 'test',
          defaultValue: 'test',
        }),
      );

      act(() => {
        expect(Object.keys(watchFieldsHookRenderRef.current)).toEqual(['123']);
        expect(watchFieldsHookRef.current).toEqual({
          '123': new Set(),
        });
        expect(generateId).toBeCalled();
      });
    });
  });

  describe('update', () => {
    it('should partial re-render', async () => {
      let childCount = 0;
      const Child = ({
        register,
        control,
      }: {
        register: (ref: HTMLInputElement) => void;
        control: Control;
      }) => {
        useWatch({ name: 'child', control });
        childCount++;
        return <input type="text" name="child" ref={register} />;
      };

      let parentCount = 0;
      const Parent = () => {
        const { register, handleSubmit, control } = useForm();
        parentCount++;
        return (
          <form onSubmit={handleSubmit(() => {})}>
            <input type="text" name="parent" ref={register} />
            <Child register={register} control={control} />
            <button>submit</button>
          </form>
        );
      };

      render(<Parent />);

      const childInput = screen.getAllByRole('textbox')[1];

      fireEvent.input(childInput, {
        target: { value: 'test' },
      });

      expect(parentCount).toBe(1);
      expect(childCount).toBe(2);

      parentCount = 0;
      childCount = 0;

      await actComponent(async () => {
        await fireEvent.submit(screen.getByRole('button', { name: /submit/i }));
      });

      expect(parentCount).toBe(2);
      expect(childCount).toBe(2);

      parentCount = 0;
      childCount = 0;

      await actComponent(async () => {
        await fireEvent.input(childInput, { target: { value: 'test1' } });
      });

      expect(parentCount).toBe(0);
      expect(childCount).toBe(1);
    });

    it('should not throw error when null or undefined is set', () => {
      const watchedValue: Record<string, any> = {};
      const Component = () => {
        const { register, control } = useForm();

        register({ type: 'text', name: 'test', value: null });
        register({ type: 'text', name: 'test1', value: undefined });

        watchedValue['test'] = useWatch({ name: 'test', control });
        watchedValue['test1'] = useWatch({ name: 'test1', control });

        return <div />;
      };

      render(<Component />);

      expect(watchedValue).toEqual({ test: undefined, test1: undefined });
    });

    it('should return default value when value is undefined', () => {
      (generateId as any).mockReturnValue('1');
      const mockControl = reconfigureControl();
      const { result } = renderHook(() =>
        useWatch({
          control: {
            ...mockControl,
            watchInternal: () => 'value',
          },
          name: 'test',
          defaultValue: 'test',
        }),
      );

      act(() => mockControl.watchFieldsHookRenderRef.current['1']());

      expect(result.current).toEqual('value');
    });

    it('should return default value when value is undefined', () => {
      (generateId as any).mockReturnValue('1');
      const mockControl = reconfigureControl();
      const { result } = renderHook(() =>
        useWatch({
          control: {
            ...mockControl,
            watchInternal: () => undefined,
          },
          name: 'test',
          defaultValue: 'test',
        }),
      );

      act(() => mockControl.watchFieldsHookRenderRef.current['1']());

      expect(result.current).toEqual('test');
    });
  });

  describe('reset', () => {
    describe('with useFieldArray', () => {
      // check https://github.com/react-hook-form/react-hook-form/issues/2229
      it('should return current value with radio type', async () => {
        let watchedValue: any;
        const Component = () => {
          const { register, reset, control } = useForm();
          const { fields } = useFieldArray({ name: 'options', control });
          watchedValue = useWatch({
            control,
          });

          React.useEffect(() => {
            reset({
              options: [
                {
                  option: 'test',
                },
                {
                  option: 'test1',
                },
              ],
            });
          }, [reset]);

          return (
            <form>
              {fields.map((_, i) => (
                <div key={i.toString()}>
                  <input
                    type="radio"
                    value="yes"
                    name={`options[${i}].option`}
                    ref={register()}
                  />
                  <input
                    type="radio"
                    value="no"
                    name={`options[${i}].option`}
                    ref={register()}
                  />
                </div>
              ))}
            </form>
          );
        };

        render(<Component />);

        fireEvent.change(screen.getAllByRole('radio')[1], {
          target: {
            checked: true,
          },
        });

        expect(watchedValue).toEqual({
          options: [{ option: 'no' }, { option: '' }],
        });
      });
    });

    describe('with custom register', () => {
      it('should return registered', async () => {
        const Component = () => {
          const { register, reset, control } = useForm();
          const test = useWatch<string>({
            name: 'test',
            defaultValue: 'default',
            control,
          });

          React.useEffect(() => {
            register({ name: 'test', value: 'test' });
          }, [register]);

          React.useEffect(() => {
            reset({ test: 'default' });
          }, [reset]);

          return (
            <form>
              <input name="test" ref={register} />
              <span data-testid="result">{test}</span>
            </form>
          );
        };

        render(<Component />);

        expect((await screen.findByTestId('result')).textContent).toBe('test');
      });

      it('should return default value of reset method', async () => {
        const Component = () => {
          const { register, reset, control } = useForm();
          const test = useWatch<string>({ name: 'test', control });

          React.useEffect(() => {
            register({ name: 'test' });
          }, [register]);

          React.useEffect(() => {
            reset({ test: 'default' });
          }, [reset]);

          return (
            <form>
              <span>{test}</span>
            </form>
          );
        };

        render(<Component />);

        expect(await screen.findByText('default')).toBeDefined();
      });

      it('should return default value', async () => {
        const Component = () => {
          const { register, reset, control } = useForm();
          const test = useWatch<string>({
            name: 'test',
            defaultValue: 'test',
            control,
          });

          React.useEffect(() => {
            register({ name: 'test' });
          }, [register]);

          React.useEffect(() => {
            reset();
          }, [reset]);

          return (
            <form>
              <span>{test}</span>
            </form>
          );
        };

        render(<Component />);

        expect(await screen.findByText('test')).toBeDefined();
      });
    });
  });

  describe('formContext', () => {
    it('should work with form context', async () => {
      const Component = () => {
        const test = useWatch<String>({ name: 'test' });
        return <div>{test}</div>;
      };

      const Form = () => {
        const methods = useForm({ defaultValues: { test: 'test' } });

        return (
          <FormProvider {...methods}>
            <Component />
          </FormProvider>
        );
      };

      render(<Form />);

      expect(await screen.findByText('test')).toBeDefined();
    });
  });
});
