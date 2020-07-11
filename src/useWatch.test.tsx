import * as React from 'react';
import { useForm } from './useForm';
import { useWatch } from './useWatch';
import generateId from './logic/generateId';
import { renderHook, act } from '@testing-library/react-hooks';
import { render, screen } from '@testing-library/react';
import { reconfigureControl } from './__mocks__/reconfigureControl';

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
});
