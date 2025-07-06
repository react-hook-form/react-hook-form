import shouldRenderFormState from '../../logic/shouldRenderFormState';
import type { ReadFormState } from '../../types';

describe('shouldRenderFormState', () => {
  const updateFormState = jest.fn();

  beforeEach(() => {
    updateFormState.mockClear();
  });

  it('should return true when formState is Empty', () => {
    const proxy = {
      isValid: true,
    } as ReadFormState;
    const result = shouldRenderFormState({}, proxy, updateFormState);
    expect(result).toBe(true);
  });

  it('should return true when changed keys are more', () => {
    const proxy = { isValid: true } as ReadFormState;
    const result = shouldRenderFormState(
      { isValid: false, isDirty: true },
      proxy,
      updateFormState,
    );
    expect(result).toBe(true);
  });

  it('should return true when changed state key is subscribed', () => {
    const proxy: ReadFormState = {
      isDirty: true,
      isValid: false,
    } as ReadFormState;
    const result = shouldRenderFormState(
      { isDirty: true },
      proxy,
      updateFormState,
    );

    expect(result).toBe('isDirty');
    expect(updateFormState).toHaveBeenCalledWith({ isDirty: true });
  });

  it('should return false when changed state key is not subscribed', () => {
    const proxy: ReadFormState = {
      isDirty: false,
      isValid: true,
    } as ReadFormState;
    const result = shouldRenderFormState(
      { isDirty: true },
      proxy,
      updateFormState,
    );

    expect(result).toBeUndefined();
  });

  describe('when root subscribe', () => {
    it('should return subscribed key name if expecting all', () => {
      const proxy: ReadFormState = {
        isDirty: 'all',
        isValid: false,
      } as ReadFormState;
      const result = shouldRenderFormState(
        { isDirty: true },
        proxy,
        updateFormState,
        true,
      );

      expect(result).toBe('isDirty');
    });

    it('should return undefined if not expecting all', () => {
      const proxy: ReadFormState = {
        isDirty: true,
        isValid: false,
      } as ReadFormState;
      const result = shouldRenderFormState(
        { isDirty: true },
        proxy,
        updateFormState,
        true,
      );

      expect(result).toBeUndefined();
    });
  });
});
