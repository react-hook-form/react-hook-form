import { useWatch } from './useWatch';
import generateId from './logic/generateId';
import { renderHook } from '@testing-library/react-hooks';
import { reconfigureControl } from './__mocks__/reconfigureControl';
import { act } from 'react-test-renderer';

jest.mock('./logic/generateId');

describe('useWatch', () => {
  it('should return default value', () => {
    const { result } = renderHook(() =>
      useWatch({
        control: reconfigureControl(),
        name: 'test',
        defaultValue: 'test',
      }),
    );

    expect(result.current).toEqual('test');
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

  it('should invoked generateId and set up watchFieldsHook and watchFieldsHookRender after mount ', () => {
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

  it('should update watch value when input changes', () => {
    (generateId as any).mockImplementation(() => {
      return '123';
    });
    const watchFieldsHookRenderRef = {
      current: {},
    };
    const watchFieldsHookRef = {
      current: {},
    };
    const { result } = renderHook(() =>
      useWatch({
        control: {
          ...reconfigureControl(),
          watchInternal: () => 'watchInternal',
          watchFieldsHookRenderRef,
          watchFieldsHookRef,
        },
        name: 'test',
        defaultValue: 'test',
      }),
    );

    act(() => {
      // @ts-ignore
      watchFieldsHookRenderRef.current['123']();
    });

    act(() => {
      expect(result.current).toEqual('watchInternal');
    });
  });
});
