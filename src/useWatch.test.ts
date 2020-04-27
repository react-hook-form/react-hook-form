import { useWatch } from './useWatch';
import { renderHook } from '@testing-library/react-hooks';
import { reconfigureControl } from './useForm.test';

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
});
