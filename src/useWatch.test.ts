import { useWatch } from './useWatch';
import generateId from './logic/generateId';
import { renderHook } from '@testing-library/react-hooks';
import { reconfigureControl } from './useForm.test';
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

    expect(result.current).toEqual({ state: 'test' });
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
      expect(result.current).toEqual({ state: 'watchInternal' });
    });
  });
});
