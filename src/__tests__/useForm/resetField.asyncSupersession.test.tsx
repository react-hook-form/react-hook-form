import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import type { Resolver, UseFormReturn } from '../../types';
import { useForm } from '../../useForm';

type Values = { test: string; other: string };
type Request = {
  settled: boolean;
  resolve: () => void;
  operation?: Promise<unknown>;
};

const setup = async () => {
  const requests: Request[] = [];
  const operations: Promise<unknown>[] = [];
  let methods!: UseFormReturn<Values>;
  const resolver: Resolver<Values> = async (values) => {
    const snapshot = { ...values };
    await new Promise<void>((resolve) => {
      const request: Request = {
        settled: false,
        resolve: () => {
          request.settled = true;
          resolve();
        },
      };
      requests.push(request);
    });
    return { values: snapshot, errors: {} };
  };
  const App = () => {
    methods = useForm<Values>({
      defaultValues: { test: 'old', other: 'other' },
      resolver,
    });
    const { isValid, isValidating } = methods.formState;
    return (
      <>
        <input aria-label="test" {...methods.register('test')} />
        <input aria-label="other" {...methods.register('other')} />
        <output aria-label="valid">{isValid ? 'yes' : 'no'}</output>
        <output aria-label="pending">{isValidating ? 'yes' : 'no'}</output>
      </>
    );
  };
  render(<App />);
  await act(async () => {
    requests.splice(0).forEach(({ resolve }) => resolve());
  });
  const change = (value: string) => {
    fireEvent.change(screen.getByRole('textbox', { name: 'test' }), {
      target: { value },
    });
  };
  const start = (name: keyof Values) => {
    const index = requests.length;
    const operation = methods.trigger(name).catch((error: unknown) => error);
    operations.push(operation);
    requests[index].operation = operation;
    return index;
  };
  const finish = async (index: number) => {
    let outcome: unknown;
    await act(async () => {
      requests[index].resolve();
      outcome = await requests[index].operation;
    });
    return outcome;
  };
  const release = async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const pending = requests.filter(({ settled }) => !settled);
      if (!pending.length) break;
      await act(async () => {
        pending.forEach(({ resolve }) => resolve());
        await Promise.all(operations);
      });
    }
    expect(requests.every(({ settled }) => settled)).toBe(true);
  };
  return {
    requests,
    methods: () => methods,
    pending: () => screen.getByLabelText('pending').textContent === 'yes',
    change,
    start,
    finish,
    release,
  };
};

describe('resolver background validity supersession', () => {
  it('supersedes older internal work with an explicit trigger', async () => {
    const editor = await setup();
    try {
      act(() => editor.change('changed'));
      expect(editor.requests).toHaveLength(1);
      let current!: number;
      act(() => {
        current = editor.start('test');
      });
      expect(await editor.finish(current)).toBe(true);
      expect(editor.pending()).toBe(false);
      await editor.finish(0);
      expect(editor.pending()).toBe(false);
    } finally {
      await editor.release();
    }
  });

  it('does not restart stale internal work after reset', async () => {
    const editor = await setup();
    try {
      act(() => editor.change('changed'));
      expect(editor.requests).toHaveLength(1);
      await act(async () => {
        editor
          .methods()
          .reset({ test: 'new', other: 'other' }, { keepIsValid: true });
      });
      let current!: number;
      act(() => {
        current = editor.start('test');
      });
      await editor.finish(0);
      expect(editor.pending()).toBe(true);
      expect(await editor.finish(current)).toBe(true);
      expect(editor.pending()).toBe(false);
    } finally {
      await editor.release();
    }
  });

  it('preserves user triggers when internal work is retired', async () => {
    const editor = await setup();
    try {
      act(() => editor.change('changed'));
      expect(editor.requests).toHaveLength(1);
      let other!: number;
      let current!: number;
      act(() => {
        other = editor.start('other');
        current = editor.start('test');
      });
      expect(await editor.finish(current)).toBe(true);
      expect(editor.pending()).toBe(true);
      expect(await editor.finish(other)).toBe(true);
      expect(editor.pending()).toBe(false);
      await editor.finish(0);
      expect(editor.pending()).toBe(false);
    } finally {
      await editor.release();
    }
  });

  it('counts only the latest internal validity computation', async () => {
    const editor = await setup();
    try {
      act(() => editor.change('first'));
      act(() => editor.change('second'));
      expect(editor.requests).toHaveLength(2);
      await editor.finish(1);
      expect(editor.pending()).toBe(false);
      await editor.finish(0);
      expect(editor.pending()).toBe(false);
    } finally {
      await editor.release();
    }
  });

  it('preserves user siblings when reset retires internal work', async () => {
    const editor = await setup();
    try {
      let other!: number;
      act(() => {
        other = editor.start('other');
      });
      act(() => editor.change('changed'));
      expect(editor.requests).toHaveLength(2);
      await act(async () => {
        editor.methods().resetField('test', { keepError: true });
      });
      expect(editor.pending()).toBe(true);
      expect(await editor.finish(other)).toBe(true);
      expect(editor.pending()).toBe(false);
      await editor.finish(1);
      expect(editor.pending()).toBe(false);
    } finally {
      await editor.release();
    }
  });

  it('does not publish an idle gap when a trigger takes over', async () => {
    const editor = await setup();
    const events: boolean[] = [];
    let unsubscribe: (() => void) | undefined;
    try {
      act(() => editor.change('changed'));
      expect(editor.requests).toHaveLength(1);
      unsubscribe = editor.methods().subscribe({
        formState: { isValidating: true },
        callback: ({ isValidating }) => events.push(isValidating),
      });
      let current!: number;
      act(() => {
        current = editor.start('test');
      });
      expect(events.length).toBeGreaterThan(0);
      expect(events).not.toContain(false);
      expect(editor.pending()).toBe(true);
      expect(await editor.finish(current)).toBe(true);
      expect(editor.pending()).toBe(false);
    } finally {
      unsubscribe?.();
      await editor.release();
    }
  });
});
