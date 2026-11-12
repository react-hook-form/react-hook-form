import { act, renderHook } from '@testing-library/react';

import type { Resolver, UseFormReturn } from '../../types';
import { useForm } from '../../useForm';

type Values = { group: { item: string; other: string }; outside: string };

const setup = () => {
  const requests: (() => void)[] = [];
  const operations: Promise<boolean>[] = [];
  const resolver: Resolver<Values> = async (values) => {
    await new Promise<void>((resolve) => {
      requests.push(resolve);
    });
    return { values, errors: {} };
  };
  const hook = renderHook(() => {
    const methods = useForm<Values>({
      defaultValues: {
        group: { item: 'item', other: 'other' },
        outside: 'outside',
      },
      resolver,
    });
    methods.register('group.item');
    methods.register('group.other');
    methods.register('outside');
    return { methods, pending: methods.formState.isValidating };
  });
  const start = (name: 'group' | 'group.other' | 'outside') => {
    const operation = hook.result.current.methods.trigger(name);
    operations.push(operation);
    return operation;
  };
  const finish = async (index: number) => {
    await act(async () => {
      requests[index]();
      await operations[index];
    });
  };
  const release = async () => {
    await act(async () => {
      requests.forEach((resolve) => resolve());
      await Promise.all(operations);
    });
  };
  return { ...hook, requests, start, finish, release };
};

describe('resolver pending ownership after resetField', () => {
  it.each([
    ['group', 0],
    ['group', 1],
    ['group.other', 0],
    ['group.other', 1],
  ] as const)(
    'keeps overlapping %s requests pending when request %s finishes first',
    async (nextName, first) => {
      const editor = setup();
      try {
        act(() => {
          editor.start('group');
          editor.result.current.methods.resetField('group.item');
        });
        expect(editor.requests).toHaveLength(1);
        expect(editor.result.current.pending).toBe(true);
        act(() => {
          editor.start(nextName);
        });
        expect(editor.requests).toHaveLength(2);
        await editor.finish(first);
        expect(editor.result.current.pending).toBe(true);
        await editor.finish(1 - first);
        expect(editor.result.current.pending).toBe(false);
      } finally {
        await editor.release();
      }
    },
  );

  it('keeps outside work pending after all group fields reset', async () => {
    const editor = setup();
    try {
      act(() => {
        editor.start('group');
        editor.start('outside');
        editor.result.current.methods.resetField('group.item');
        editor.result.current.methods.resetField('group.other');
      });
      expect(editor.result.current.pending).toBe(true);
      await editor.finish(1);
      expect(editor.result.current.pending).toBe(false);
      await editor.finish(0);
      expect(editor.result.current.pending).toBe(false);
    } finally {
      await editor.release();
    }
  });

  it.each(['reset', 'unregister'] as const)(
    'does not retain retired work after %s when the new request finishes first',
    async (operation) => {
      const editor = setup();
      try {
        act(() => {
          editor.start('group');
          if (operation === 'reset') {
            editor.result.current.methods.reset();
          } else {
            editor.result.current.methods.unregister('group');
          }
          editor.result.current.methods.register('group.item');
          editor.result.current.methods.register('group.other');
          editor.start('group');
        });
        expect(editor.requests).toHaveLength(2);
        await editor.finish(1);
        expect(editor.result.current.pending).toBe(false);
        await editor.finish(0);
        expect(editor.result.current.pending).toBe(false);
      } finally {
        await editor.release();
      }
    },
  );

  it('clears retained unregister work when it completes', async () => {
    const editor = setup();
    try {
      act(() => {
        editor.start('group');
        editor.result.current.methods.unregister('group', {
          keepIsValidating: true,
        });
      });
      expect(editor.result.current.pending).toBe(true);
      await editor.finish(0);
      expect(editor.result.current.pending).toBe(false);
    } finally {
      await editor.release();
    }
  });

  it.each([0, 1])(
    'keeps overlapping ancestor and newly registered descendant pending when request %s finishes first',
    async (first) => {
      const editor = setup();
      try {
        act(() => {
          editor.result.current.methods.unregister('group');
          editor.start('group');
          editor.result.current.methods.register('group.other');
          editor.start('group.other');
        });
        expect(editor.requests).toHaveLength(2);
        await editor.finish(first);
        expect(editor.result.current.pending).toBe(true);
        await editor.finish(1 - first);
        expect(editor.result.current.pending).toBe(false);
      } finally {
        await editor.release();
      }
    },
  );

  it('preserves reentrant validation started after reset', async () => {
    const requests: (() => void)[] = [];
    let methods!: UseFormReturn<Values>;
    let old!: Promise<boolean>;
    let fresh!: Promise<boolean>;
    const resolver: Resolver<Values> = async (values) => {
      const pending = new Promise<void>((resolve) => {
        requests.push(resolve);
      });
      if (requests.length === 1) {
        methods.resetField('group.item');
        fresh = methods.trigger('group');
      }
      await pending;
      return { values, errors: {} };
    };
    const { result } = renderHook(() => {
      methods = useForm<Values>({
        defaultValues: {
          group: { item: 'item', other: 'other' },
          outside: 'outside',
        },
        resolver,
      });
      methods.register('group.item');
      methods.register('group.other');
      return methods.formState.isValidating;
    });
    try {
      act(() => {
        old = methods.trigger('group');
      });
      expect(requests).toHaveLength(2);
      await act(async () => {
        requests[0]();
        await old;
      });
      expect(result.current).toBe(true);
      await act(async () => {
        requests[1]();
        await fresh;
      });
      expect(result.current).toBe(false);
    } finally {
      await act(async () => {
        requests.forEach((resolve) => resolve());
        await Promise.all([old, fresh]);
      });
    }
  });
});
