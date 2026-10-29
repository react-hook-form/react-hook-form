import { createFormControl } from '../../logic/createFormControl';
import type { ResolverResult } from '../../types';

type Values = { first: string; second: string };
const success: ResolverResult<Values> = {
  values: { first: '', second: '' },
  errors: {},
};
function deferred() {
  let resolve!: (value: ResolverResult<Values>) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<ResolverResult<Values>>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function setup(resolver: () => Promise<ResolverResult<Values>>) {
  const form = createFormControl<Values>({
    resolver,
    defaultValues: { first: '', second: '' },
  });
  form.register('first');
  form.register('second');
  let state = { isValidating: false, validatingFields: {} };
  const unsubscribe = form.subscribe({
    formState: { isValidating: true, validatingFields: true },
    callback: (next) => {
      state = {
        isValidating: next.isValidating,
        validatingFields: next.validatingFields,
      };
    },
  });
  return { form, state: () => state, unsubscribe };
}
describe('resolver rejection validating state', () => {
  it.each(['submit', 'trigger'] as const)(
    'settles %s and preserves the original rejection',
    async (action) => {
      const error = new Error('resolver failed');
      const pending = deferred();
      const { form, state, unsubscribe } = setup(() => pending.promise);
      const operation =
        action === 'submit' ? form.handleSubmit(jest.fn())() : form.trigger();
      const rejected = expect(operation).rejects.toBe(error);
      expect(state().isValidating).toBe(true);
      pending.reject(error);
      await rejected;
      expect(state()).toEqual({ isValidating: false, validatingFields: {} });
      unsubscribe();
    },
  );
  it.each([undefined, 0, false, ''])(
    'preserves a falsy thrown value: %s',
    async (error) => {
      const { form, state, unsubscribe } = setup(() => {
        throw error;
      });
      await expect(form.trigger()).rejects.toBe(error);
      expect(state().isValidating).toBe(false);
      unsubscribe();
    },
  );
  it('does not clear a newer validation for an overlapping field', async () => {
    const first = deferred(),
      second = deferred();
    let calls = 0;
    const { form, state, unsubscribe } = setup(() =>
      ++calls === 1 ? first.promise : second.promise,
    );
    const older = form.trigger();
    const rejected = expect(older).rejects.toBe('older');
    const newer = form.trigger('first');
    first.reject('older');
    await rejected;
    expect(state()).toEqual({
      isValidating: true,
      validatingFields: { first: true },
    });
    second.resolve(success);
    await newer;
    expect(state().isValidating).toBe(false);
    unsubscribe();
  });
  it('clears the newest rejection without reviving an older pending pass', async () => {
    const first = deferred(),
      second = deferred();
    let calls = 0;
    const { form, state, unsubscribe } = setup(() =>
      ++calls === 1 ? first.promise : second.promise,
    );
    const older = form.trigger('first');
    const olderRejected = expect(older).rejects.toBe('older');
    const newer = form.trigger('first');
    const newerRejected = expect(newer).rejects.toBe('newer');
    second.reject('newer');
    await newerRejected;
    expect(state().isValidating).toBe(false);
    first.reject('older');
    await olderRejected;
    expect(state().isValidating).toBe(false);
    unsubscribe();
  });
  it('keeps reset state authoritative even when keepIsValidating is requested', async () => {
    const pending = deferred();
    const { form, state, unsubscribe } = setup(() => pending.promise);
    const operation = form.trigger();
    const rejected = expect(operation).rejects.toBe('old');
    form.reset(undefined, { keepIsValidating: true });
    pending.reject('old');
    await rejected;
    expect(state()).toEqual({
      isValidating: true,
      validatingFields: { first: true, second: true },
    });
    unsubscribe();
  });
  it('does not clear a new pass started after reset', async () => {
    const first = deferred(),
      second = deferred();
    let calls = 0;
    const { form, state, unsubscribe } = setup(() =>
      ++calls === 1 ? first.promise : second.promise,
    );
    const older = form.trigger();
    const rejected = expect(older).rejects.toBe('old');
    form.reset();
    form.register('first');
    const newer = form.trigger('first');
    first.reject('old');
    await rejected;
    expect(state()).toEqual({
      isValidating: true,
      validatingFields: { first: true },
    });
    second.resolve(success);
    await newer;
    expect(state().isValidating).toBe(false);
    unsubscribe();
  });
  it('leaves successful resolver notifications unchanged', async () => {
    const pending = deferred();
    const { form, state, unsubscribe } = setup(() => pending.promise);
    const operation = form.trigger();
    pending.resolve(success);
    await expect(operation).resolves.toBe(true);
    expect(state()).toEqual({ isValidating: false, validatingFields: {} });
    unsubscribe();
  });
});

it('does not clear another field while its validation is pending', async () => {
  const first = deferred(),
    second = deferred();
  let calls = 0;
  const { form, state, unsubscribe } = setup(() =>
    ++calls === 1 ? first.promise : second.promise,
  );
  const older = form.trigger('first');
  const rejected = expect(older).rejects.toBe('old');
  const newer = form.trigger('second');
  first.reject('old');
  await rejected;
  expect(state()).toEqual({
    isValidating: true,
    validatingFields: { second: true },
  });
  second.resolve(success);
  await newer;
  expect(state().isValidating).toBe(false);
  unsubscribe();
});
it('keeps a reentrant validation started by a state subscriber', async () => {
  const first = deferred(),
    second = deferred();
  let calls = 0;
  const { form, state, unsubscribe } = setup(() =>
    ++calls === 1 ? first.promise : second.promise,
  );
  let newer: Promise<boolean> | undefined;
  const unsub = form.subscribe({
    formState: { isValidating: true },
    callback: (s) => {
      if (s.isValidating && !newer) {
        newer = Promise.resolve(false);
        newer = form.trigger('first');
      }
    },
  });
  const older = form.trigger('first');
  const rejected = expect(older).rejects.toBe('old');
  // The nested run starts before the outer resolver is invoked.
  second.reject('old');
  await rejected;
  expect(state().isValidating).toBe(true);
  first.resolve(success);
  await newer;
  expect(state().isValidating).toBe(false);
  unsub();
  unsubscribe();
});
it('can validate and submit successfully after a rejected resolver', async () => {
  let calls = 0;
  const error = new Error('offline');
  const { form, state, unsubscribe } = setup(async () => {
    if (++calls === 1) throw error;
    return success;
  });
  const saved = jest.fn();
  await expect(form.handleSubmit(saved)()).rejects.toBe(error);
  expect(state().isValidating).toBe(false);
  await form.handleSubmit(saved)();
  expect(saved).toHaveBeenCalledWith(success.values, undefined);
  expect(state().isValidating).toBe(false);
  unsubscribe();
});
it('does not clear a new built-in validation after the resolver is removed', async () => {
  const pending = deferred();
  let resolveBuiltIn!: (value: boolean) => void;
  const { form, state, unsubscribe } = setup(() => pending.promise);
  const old = form.trigger('first');
  const rejected = expect(old).rejects.toBe('old');
  form.control._options = { ...form.control._options, resolver: undefined };
  form.register('first', {
    validate: async () =>
      new Promise<boolean>((resolve) => {
        resolveBuiltIn = resolve;
      }),
  });
  const newer = form.trigger('first');
  pending.reject('old');
  await rejected;
  expect(state()).toEqual({
    isValidating: true,
    validatingFields: { first: true },
  });
  resolveBuiltIn(true);
  await newer;
  expect(state().isValidating).toBe(false);
  unsubscribe();
});
it.each(['resetField', 'unregister'] as const)(
  'does not publish obsolete cleanup after %s',
  async (action) => {
    const pending = deferred();
    const { form, state, unsubscribe } = setup(() => pending.promise);
    const old = form.trigger('first');
    const rejected = expect(old).rejects.toBe('old');
    let emissions = 0;
    const unsub = form.subscribe({
      formState: { isValidating: true },
      callback: () => {
        emissions++;
      },
    });
    if (action === 'resetField') form.resetField('first');
    else form.unregister('first');
    const before = emissions;
    pending.reject('old');
    await rejected;
    expect(emissions).toBe(before);
    expect(state().isValidating).toBe(false);
    unsub();
    unsubscribe();
  },
);
