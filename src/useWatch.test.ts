import { useWatch } from './useWatch';
import { renderHook } from '@testing-library/react-hooks';
import { reconfigureControl } from './useForm.test';
import { act } from 'react-test-renderer';

jest.mock('./logic/generateId', () => ({
  default: () => '123',
}));

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

  it('should set up watchFieldsHook and watchFieldsHookRender after mount', () => {
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
    });
  });
});
