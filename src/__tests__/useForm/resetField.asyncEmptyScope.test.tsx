import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import type { Resolver, UseFormReturn } from '../../types';
import { useForm } from '../../useForm';

type Values = { test: string; other: string };
type Request = {
  names: string[];
  settled: boolean;
  resolve: () => void;
  completed: Promise<void>;
  operation?: Promise<unknown>;
};
type Pending = { pending: boolean; test?: boolean; other?: boolean };

const setup = async (includeOther = false) => {
  const requests: Request[] = [];
  const operations: Promise<unknown>[] = [];
  let current: Pending = { pending: false };
  let methods!: UseFormReturn<Values>;
  let hide!: () => void;
  const resolver: Resolver<Values> = async (values, _, options) => {
    const snapshot = { ...values };
    let complete!: () => void;
    const completed = new Promise<void>((resolve) => {
      complete = resolve;
    });
    const request: Request = {
      names: [...(options.names || [])],
      settled: false,
      completed,
      resolve: () => {
        request.settled = true;
        complete();
      },
    };
    requests.push(request);
    await completed;
    return { values: snapshot, errors: {} };
  };
  const App = () => {
    const [visible, setVisible] = React.useState(true);
    hide = () => setVisible(false);
    methods = useForm<Values>({
      defaultValues: { test: 'old', other: 'other' },
      resolver,
    });
    const { isValid } = methods.formState;
    return (
      <>
        {visible && (
          <>
            <input aria-label="test" {...methods.register('test')} />
            {includeOther && (
              <input aria-label="other" {...methods.register('other')} />
            )}
          </>
        )}
        <output aria-label="valid">{isValid ? 'yes' : 'no'}</output>
      </>
    );
  };
  render(<App />);
  for (let round = 0; round < 4; round++) {
    const pending = requests.filter(({ settled }) => !settled);
    if (!pending.length) break;
    await act(async () => {
      pending.forEach(({ resolve }) => resolve());
      await Promise.all(pending.map(({ completed }) => completed));
    });
  }
  expect(requests.every(({ settled }) => settled)).toBe(true);
  requests.splice(0);
  const unsubscribe = methods.subscribe({
    formState: { isValidating: true },
    callback: ({ isValidating, validatingFields }) => {
      current = {
        pending: isValidating,
        test: validatingFields.test,
        other: validatingFields.other,
      };
    },
  });
  const change = () => {
    const index = requests.length;
    fireEvent.change(screen.getByRole('textbox', { name: 'test' }), {
      target: { value: 'changed' },
    });
    return index;
  };
  const remove = (retain = true) => {
    hide();
    methods.unregister(includeOther ? ['test', 'other'] : 'test', {
      keepIsValidating: retain,
      keepIsValid: true,
    });
  };
  const start = (name?: keyof Values) => {
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
      await requests[index].completed;
      outcome = await requests[index].operation;
    });
    return outcome;
  };
  const release = async () => {
    try {
      for (let round = 0; round < 4; round++) {
        const pending = requests.filter(({ settled }) => !settled);
        if (!pending.length) break;
        await act(async () => {
          pending.forEach(({ resolve }) => resolve());
          await Promise.all(pending.map(({ completed }) => completed));
          await Promise.all(operations);
        });
      }
      expect(requests.every(({ settled }) => settled)).toBe(true);
      const outcomes = await Promise.all(operations);
      expect(outcomes.every((value) => value === true)).toBe(true);
    } finally {
      unsubscribe();
    }
  };
  return {
    requests,
    methods: () => methods,
    state: () => current,
    change,
    remove,
    start,
    finish,
    release,
  };
};

describe('deferred resolver pending state with an empty incoming scope', () => {
  it.each([false, true])(
    'publishes retired ownership with an empty takeover, old first: %s',
    async (oldFirst) => {
      const editor = await setup();
      try {
        let old!: number;
        let fresh!: number;
        act(() => {
          old = editor.change();
        });
        expect(editor.state().pending).toBe(true);
        act(() => editor.remove());
        expect(editor.state().pending).toBe(true);
        act(() => {
          fresh = editor.start();
        });
        expect(editor.requests[fresh].names).toEqual([]);
        await editor.finish(oldFirst ? old : fresh);
        await editor.finish(oldFirst ? fresh : old);
        expect(editor.requests.every(({ settled }) => settled)).toBe(true);
        expect(editor.state().pending).toBe(false);
      } finally {
        await editor.release();
      }
    },
  );

  it('publishes retained unregister completion', async () => {
    const editor = await setup();
    try {
      let old!: number;
      act(() => {
        old = editor.change();
      });
      act(() => editor.remove());
      expect(editor.state().pending).toBe(true);
      await editor.finish(old);
      expect(editor.state().pending).toBe(false);
    } finally {
      await editor.release();
    }
  });

  it('keeps default unregister idle', async () => {
    const editor = await setup();
    try {
      let old!: number;
      let fresh!: number;
      act(() => {
        old = editor.change();
      });
      act(() => editor.remove(false));
      expect(editor.state().pending).toBe(false);
      act(() => {
        fresh = editor.start();
      });
      expect(editor.requests[fresh].names).toEqual([]);
      expect(await editor.finish(fresh)).toBe(true);
      await editor.finish(old);
      expect(editor.state().pending).toBe(false);
    } finally {
      await editor.release();
    }
  });

  it('keeps unrelated ownership during empty takeover', async () => {
    const editor = await setup(true);
    try {
      let other!: number;
      let old!: number;
      let fresh!: number;
      act(() => {
        other = editor.start('other');
      });
      act(() => {
        old = editor.change();
      });
      act(() => editor.remove());
      act(() => {
        fresh = editor.start();
      });
      expect(editor.requests[fresh].names).toEqual([]);
      expect(editor.state().pending).toBe(true);
      expect(editor.state().test).toBeUndefined();
      expect(editor.state().other).toBe(true);
      expect(await editor.finish(fresh)).toBe(true);
      await editor.finish(old);
      expect(editor.state().pending).toBe(true);
      expect(await editor.finish(other)).toBe(true);
      expect(editor.state().pending).toBe(false);
    } finally {
      await editor.release();
    }
  });

  it('keeps reset retention until fresh validation', async () => {
    const editor = await setup();
    try {
      let old!: number;
      let fresh!: number;
      act(() => {
        old = editor.change();
      });
      const methods = editor.methods();
      const retain = { keepIsValidating: true, keepIsValid: true };
      await act(async () => {
        methods.reset({ test: 'new', other: 'other' }, retain);
      });
      expect(editor.state().pending).toBe(true);
      await editor.finish(old);
      expect(editor.state().pending).toBe(true);
      act(() => {
        fresh = editor.start('test');
      });
      expect(editor.requests[fresh].names).toEqual(['test']);
      expect(await editor.finish(fresh)).toBe(true);
      expect(editor.state().pending).toBe(false);
    } finally {
      await editor.release();
    }
  });
});
