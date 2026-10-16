import shouldRenderFormState from '../../logic/shouldRenderFormState';
import type { ReadFormState } from '../../types';

describe('shouldRenderFormState', () => {
  it('return true when formState is Empty', () => {
    const proxy = {
      isValid: true,
    } as ReadFormState;
    const result = shouldRenderFormState({}, proxy);
    expect(result).toBe(true);
  });

  it('return matched key when incoming state contains subscribed key among others', () => {
    const proxy = { isValid: true } as ReadFormState;
    const result = shouldRenderFormState(
      { isValid: false, isDirty: true },
      proxy,
    );
    expect(result).toBe('isValid');
  });

  it('not notify when incoming state keys do not overlap with subscribed keys', () => {
    const proxy = { values: true } as ReadFormState;
    const result = shouldRenderFormState(
      { name: 'secondName', errors: {} },
      proxy,
    );
    expect(result).toBeUndefined();
  });

  it('return true when changed state key is subscribed', () => {
    const proxy: ReadFormState = {
      isDirty: true,
      isValid: false,
    } as ReadFormState;
    const result = shouldRenderFormState({ isDirty: true }, proxy);

    expect(result).toBe('isDirty');
  });

  it('return false when changed state key is not subscribed', () => {
    const proxy: ReadFormState = {
      isDirty: false,
      isValid: true,
    } as ReadFormState;
    const result = shouldRenderFormState({ isDirty: true }, proxy);

    expect(result).toBeUndefined();
  });

  it('calls Object.keys on formState exactly once regardless of which branch is taken', () => {
    const keysSpy = jest.spyOn(Object, 'keys');

    // non-root, non-empty, no matching key → reaches .find() branch
    const proxy = { isValid: true } as ReadFormState;
    shouldRenderFormState({ isDirty: true }, proxy);

    // Each call to shouldRenderFormState should produce exactly one
    // Object.keys(formState) call. The proxy may also be keyed once (isRoot
    // length check is skipped here), so the formState key must not appear 2-3×.
    const formStateKeyCalls = keysSpy.mock.calls.filter(
      (args) =>
        args[0] != null &&
        typeof args[0] === 'object' &&
        'isDirty' in (args[0] as object),
    );
    expect(formStateKeyCalls).toHaveLength(1);

    keysSpy.mockRestore();
  });

  describe('when root subscribe', () => {
    it('return subscribed key name if expecting all', () => {
      const proxy: ReadFormState = {
        isDirty: 'all',
        isValid: false,
      } as ReadFormState;
      const result = shouldRenderFormState({ isDirty: true }, proxy, true);

      expect(result).toBe('isDirty');
    });

    it('return undefined if not expecting all', () => {
      const proxy: ReadFormState = {
        isDirty: true,
        isValid: false,
      } as ReadFormState;
      const result = shouldRenderFormState({ isDirty: true }, proxy, true);

      expect(result).toBeUndefined();
    });
  });
});
