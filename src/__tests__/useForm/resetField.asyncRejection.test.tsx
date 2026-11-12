import { act, renderHook } from '@testing-library/react';

import type { Resolver } from '../../types';
import { useForm } from '../../useForm';

type Values = { item: string };
type Request = { resolve: () => void; reject: (error: Error) => void };

const setup = () => {
  const requests: Request[] = [];
  const operations: Promise<unknown>[] = [];
  const resolver: Resolver<Values> = async (values) => {
    await new Promise<void>((resolve, reject) => {
      requests.push({ resolve, reject });
    });
    return { values, errors: {} };
  };
  const hook = renderHook(() => {
    const methods = useForm<Values>({
      defaultValues: { item: 'current' },
      resolver,
    });
    methods.register('item');
    return { methods, pending: methods.formState.isValidating };
  });
  const start = () => {
    operations.push(
      hook.result.current.methods.trigger('item').then(
        () => undefined,
        (error: unknown) => error,
      ),
    );
  };
  const finish = async (index: number, error?: Error) => {
    let outcome: unknown;
    await act(async () => {
      error ? requests[index].reject(error) : requests[index].resolve();
      outcome = await operations[index];
    });
    return outcome;
  };
  const release = async () => {
    await act(async () => {
      requests.forEach(({ resolve }) => resolve());
      await Promise.all(operations);
    });
  };
  return { ...hook, requests, start, finish, release };
};

describe('resolver rejection after field validation', () => {
  it('recovers after rejection and same-field retry', async () => {
    const editor = setup();
    const failure = new Error('resolver rejected');
    try {
      act(() => editor.start());
      expect(editor.requests).toHaveLength(1);
      expect(await editor.finish(0, failure)).toBe(failure);
      act(() => editor.start());
      expect(editor.requests).toHaveLength(2);
      expect(editor.result.current.pending).toBe(true);
      expect(await editor.finish(1)).toBeUndefined();
      expect(editor.result.current.pending).toBe(false);
    } finally {
      await editor.release();
    }
  });

  it('preserves overlapping work when a resolver rejects', async () => {
    const editor = setup();
    const failure = new Error('overlapping resolver rejected');
    try {
      act(() => {
        editor.start();
        editor.start();
      });
      expect(editor.requests).toHaveLength(2);
      expect(await editor.finish(0, failure)).toBe(failure);
      expect(editor.result.current.pending).toBe(true);
      expect(await editor.finish(1)).toBeUndefined();
      expect(editor.result.current.pending).toBe(false);
    } finally {
      await editor.release();
    }
  });

  it('completes without rejection', async () => {
    const editor = setup();
    try {
      act(() => editor.start());
      expect(editor.requests).toHaveLength(1);
      expect(editor.result.current.pending).toBe(true);
      expect(await editor.finish(0)).toBeUndefined();
      expect(editor.result.current.pending).toBe(false);
    } finally {
      await editor.release();
    }
  });

  it('retains reset pending state until fresh validation ends', async () => {
    const editor = setup();
    const failure = new Error('pre-reset resolver rejected');
    try {
      act(() => {
        editor.start();
        editor.result.current.methods.reset(undefined, {
          keepIsValidating: true,
        });
      });
      expect(editor.requests).toHaveLength(1);
      expect(editor.result.current.pending).toBe(true);
      expect(await editor.finish(0, failure)).toBe(failure);
      expect(editor.result.current.pending).toBe(true);
      act(() => editor.start());
      expect(editor.requests).toHaveLength(2);
      expect(await editor.finish(1)).toBeUndefined();
      expect(editor.result.current.pending).toBe(false);
    } finally {
      await editor.release();
    }
  });
});
