import React from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';

import type { Control } from '../types';
import { useForm } from '../useForm';
import { useWatch } from '../useWatch';

const getDirtyFieldsSpy = jest.fn();
jest.mock('../logic/getDirtyFields', () => {
  const actual = jest.requireActual('../logic/getDirtyFields');
  return {
    __esModule: true,
    ...actual,
    default: (...args: unknown[]) => {
      getDirtyFieldsSpy(...args);
      return actual.default(...args);
    },
  };
});

function changeEmits(spy: jest.SpyInstance): Record<string, unknown>[] {
  return spy.mock.calls
    .map(([payload]) => payload)
    .filter(
      (p): p is Record<string, unknown> =>
        p != null && typeof p === 'object' && 'type' in p,
    );
}

describe('onChange value-clone optimization', () => {
  it('emits without a values key when no value subscribers are active', () => {
    let control: any;

    function Form() {
      const { register, control: c } = useForm({
        defaultValues: { name: '' },
      });
      control = c;
      return <input {...register('name')} data-testid="name" />;
    }

    render(<Form />);

    const nextSpy = jest.spyOn(control._subjects.state, 'next');

    fireEvent.change(screen.getByTestId('name'), { target: { value: 'a' } });
    fireEvent.change(screen.getByTestId('name'), { target: { value: 'b' } });
    fireEvent.change(screen.getByTestId('name'), { target: { value: 'c' } });

    const emits = changeEmits(nextSpy);
    expect(emits.length).toBeGreaterThan(0);
    expect(emits.every((p) => !('values' in p))).toBe(true);
  });

  it('emits a values key when watch(fn) is active', async () => {
    let control: any;

    function Form() {
      const {
        register,
        watch,
        control: c,
      } = useForm({
        defaultValues: { name: '' },
      });
      control = c;
      React.useEffect(() => {
        const sub = watch(() => {});
        return () => sub.unsubscribe();
      }, [watch]);
      return <input {...register('name')} data-testid="name" />;
    }

    render(<Form />);

    const nextSpy = jest.spyOn(control._subjects.state, 'next');

    fireEvent.change(screen.getByTestId('name'), { target: { value: 'x' } });

    const emits = changeEmits(nextSpy);
    expect(emits.some((p) => 'values' in p)).toBe(true);
  });

  it('emits a values key when useWatch is mounted', () => {
    let control: any;

    function Watcher({ ctrl }: { ctrl: Control<{ name: string }> }) {
      useWatch({ control: ctrl });
      return null;
    }

    function Form() {
      const { register, control: c } = useForm({
        defaultValues: { name: '' },
      });
      control = c;
      return (
        <>
          <Watcher ctrl={c} />
          <input {...register('name')} data-testid="name" />
        </>
      );
    }

    render(<Form />);

    const nextSpy = jest.spyOn(control._subjects.state, 'next');

    fireEvent.change(screen.getByTestId('name'), { target: { value: 'x' } });

    const emits = changeEmits(nextSpy);
    expect(emits.some((p) => 'values' in p)).toBe(true);
  });

  it('stops emitting values after watch(fn) unsubscribes', async () => {
    let control: any;
    let unsubscribeWatch: () => void;

    function Form() {
      const {
        register,
        watch,
        control: c,
      } = useForm({
        defaultValues: { name: '' },
      });
      control = c;
      React.useEffect(() => {
        const sub = watch(() => {});
        unsubscribeWatch = () => sub.unsubscribe();
      }, [watch]);
      return <input {...register('name')} data-testid="name" />;
    }

    render(<Form />);

    act(() => {
      unsubscribeWatch!();
    });

    const nextSpy = jest.spyOn(control._subjects.state, 'next');

    fireEvent.change(screen.getByTestId('name'), {
      target: { value: 'after' },
    });

    const emits = changeEmits(nextSpy);
    expect(emits.length).toBeGreaterThan(0);
    expect(emits.every((p) => !('values' in p))).toBe(true);
  });
});

describe('Throughput', () => {
  const BUDGET_MS = 3_000;

  it('handles 500 onChange events on a single field within budget', () => {
    function Form() {
      const { register } = useForm({ defaultValues: { a: '' } });
      return <input {...register('a')} data-testid="a" />;
    }

    render(<Form />);
    const input = screen.getByTestId('a');

    const t0 = performance.now();
    for (let i = 0; i < 500; i++) {
      fireEvent.change(input, { target: { value: String(i) } });
    }
    expect(performance.now() - t0).toBeLessThan(BUDGET_MS);
  });

  it('handles one change per field on a 50-field form within budget', () => {
    const names = Array.from({ length: 50 }, (_, i) => `f${i}`);

    function Form() {
      const { register } = useForm({
        defaultValues: Object.fromEntries(names.map((n) => [n, ''])) as Record<
          string,
          string
        >,
      });
      return (
        <form>
          {names.map((n) => (
            <input key={n} {...register(n as any)} data-testid={n} />
          ))}
        </form>
      );
    }

    render(<Form />);

    const t0 = performance.now();
    for (const n of names) {
      fireEvent.change(screen.getByTestId(n), { target: { value: 'x' } });
    }
    expect(performance.now() - t0).toBeLessThan(BUDGET_MS);
  });

  it('handles 500 onChange events with an active watch(fn) subscriber within budget', async () => {
    function Form() {
      const { register, watch } = useForm({ defaultValues: { a: '' } });
      React.useEffect(() => {
        const sub = watch(() => {});
        return () => sub.unsubscribe();
      }, [watch]);
      return <input {...register('a')} data-testid="a" />;
    }

    render(<Form />);
    const input = screen.getByTestId('a');

    const t0 = performance.now();
    for (let i = 0; i < 500; i++) {
      fireEvent.change(input, { target: { value: String(i) } });
    }
    expect(performance.now() - t0).toBeLessThan(BUDGET_MS);
  });

  it('runs trigger() on a 50-field form with required validation within budget', async () => {
    const names = Array.from({ length: 50 }, (_, i) => `f${i}`);

    const { result } = renderHook(() =>
      useForm({
        defaultValues: Object.fromEntries(names.map((n) => [n, ''])) as Record<
          string,
          string
        >,
      }),
    );

    for (const n of names) {
      result.current.register(n as any, { required: true });
    }

    const t0 = performance.now();
    await act(async () => {
      await result.current.trigger();
    });
    expect(performance.now() - t0).toBeLessThan(BUDGET_MS);
  });
});

describe('_getDirty optimization', () => {
  const BUDGET_MS = 3_000;

  it('handles repeated pristine/dirty toggles on one field within budget regardless of other dirty fields', () => {
    const names = Array.from({ length: 1000 }, (_, i) => `f${i}`);

    function Form() {
      const { register, formState } = useForm({
        defaultValues: Object.fromEntries(names.map((n) => [n, ''])) as Record<
          string,
          string
        >,
      });
      void formState.isDirty;
      return (
        <form>
          {names.map((n) => (
            <input key={n} {...register(n as any)} data-testid={n} />
          ))}
        </form>
      );
    }

    render(<Form />);

    // Dirty every other field so a whole-form comparison has real work to
    // do, and so isDirty can never trivially settle to a cached `false`.
    for (let i = 1; i < names.length; i += 2) {
      fireEvent.change(screen.getByTestId(`f${i}`), {
        target: { value: 'dirty' },
      });
    }

    const input = screen.getByTestId('f0');
    const t0 = performance.now();
    // Each cycle returns f0 to pristine then makes it dirty again — the
    // pristine-return is exactly the case that used to force a full
    // deepEqual of the entire 1000-field form.
    for (let i = 0; i < 150; i++) {
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.change(input, { target: { value: 'x' } });
    }
    expect(performance.now() - t0).toBeLessThan(BUDGET_MS);
  });

  it('tracks isDirty efficiently when multiple fields stay dirty (O(1) fast path)', () => {
    const names = Array.from({ length: 50 }, (_, i) => `f${i}`);

    function Form() {
      const { register, formState } = useForm({
        defaultValues: Object.fromEntries(names.map((n) => [n, ''])) as Record<
          string,
          string
        >,
      });
      void formState.isDirty;
      return (
        <form>
          {names.map((n) => (
            <input key={n} {...register(n as any)} data-testid={n} />
          ))}
        </form>
      );
    }

    render(<Form />);

    // Dirty all fields except f0 so dirtyFields is never empty during the loop.
    // This keeps the fast path active: !isEmptyObject(dirtyFields) → skip _getDirty().
    for (let i = 1; i < names.length; i++) {
      fireEvent.change(screen.getByTestId(`f${i}`), {
        target: { value: 'dirty' },
      });
    }

    const t0 = performance.now();
    for (let i = 0; i < 500; i++) {
      fireEvent.change(screen.getByTestId('f0'), {
        target: { value: String(i) },
      });
    }
    expect(performance.now() - t0).toBeLessThan(BUDGET_MS);
  });

  it('surfaces untracked setValue fields in dirtyFields when the last tracked field goes pristine', async () => {
    let capturedDirtyFields: Record<string, unknown> = {};
    let capturedIsDirty = false;

    function Form() {
      const { register, setValue, formState } = useForm({
        defaultValues: { a: '', b: '' },
      });
      capturedDirtyFields = formState.dirtyFields;
      capturedIsDirty = formState.isDirty;
      React.useEffect(() => {
        setValue('a', 'changed');
      }, [setValue]);
      return (
        <form>
          <input {...register('a')} data-testid="a" />
          <input {...register('b')} data-testid="b" />
        </form>
      );
    }

    render(<Form />);

    // Make b dirty then restore it — the only tracked-dirty field goes pristine.
    // _getDirty() fallback must detect 'a' (changed via setValue) and rebuild
    // dirtyFields so 'a' appears there.
    await act(async () => {
      fireEvent.change(screen.getByTestId('b'), { target: { value: 'x' } });
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('b'), { target: { value: '' } });
    });

    expect(capturedIsDirty).toBe(true);
    expect(capturedDirtyFields).toHaveProperty('a');
  });
});

describe('dirtyFields recompute optimization', () => {
  const BUDGET_MS = 3_000;

  beforeEach(() => {
    getDirtyFieldsSpy.mockClear();
  });

  it('does not rebuild the full dirtyFields tree on repeated keystrokes in a scalar field', () => {
    function Form() {
      const { register, formState } = useForm({
        defaultValues: { a: '', b: '', c: '' },
      });
      void formState.isDirty;
      void formState.dirtyFields;
      return (
        <form>
          <input {...register('a')} data-testid="a" />
          <input {...register('b')} data-testid="b" />
          <input {...register('c')} data-testid="c" />
        </form>
      );
    }

    render(<Form />);
    const input = screen.getByTestId('a');

    // Registration leaves the separate _getDirty dirty-name cache desynced
    // (it can't cheaply know register()'s initial values are pristine), so
    // useForm's isDirty-sync effect pays exactly one resync the first time
    // isDirty settles after mount. Let that one-time cost happen and clear
    // it before checking the property this test cares about: further
    // keystrokes shouldn't cause additional rebuilds.
    fireEvent.change(input, { target: { value: 'h' } });
    getDirtyFieldsSpy.mockClear();

    let value = 'h';
    for (const char of 'ello world'.split('')) {
      value += char;
      fireEvent.change(input, { target: { value } });
    }

    // A scalar field's dirty state is always a flat boolean, so every one of
    // these keystrokes should take the O(1) set/unset path — zero calls to
    // the full-tree recompute.
    expect(getDirtyFieldsSpy).not.toHaveBeenCalled();
  });

  it('still rebuilds the full tree for non-primitive (object/array) values', () => {
    type FormValues = { data: { id: number; name: string }[] };

    const { result } = renderHook(() =>
      useForm<FormValues>({
        defaultValues: { data: [{ id: 1, name: 'a' }] },
      }),
    );
    result.current.register('data.0.name');
    void result.current.formState.isDirty;

    act(() => {
      result.current.setValue('data', [], { shouldDirty: true });
    });

    // An array/object value can't be represented by a flat boolean leaf, so
    // the recompute must run to produce the correct nested shape.
    expect(getDirtyFieldsSpy).toHaveBeenCalled();
    expect(result.current.formState.dirtyFields).toEqual({
      data: [{ id: true, name: true }],
    });
  });

  it('recomputes once after an out-of-band setValue desyncs dirtyFields, then returns to the fast path', () => {
    function Form() {
      const { register, setValue, formState } = useForm({
        defaultValues: { a: '', b: '' },
      });
      void formState.isDirty;
      void formState.dirtyFields;
      (window as any).__setValueA = () => setValue('a', 'changed');
      return (
        <form>
          <input {...register('a')} data-testid="a" />
          <input {...register('b')} data-testid="b" />
        </form>
      );
    }

    render(<Form />);

    // Registration leaves the separate _getDirty dirty-name cache desynced,
    // so useForm's isDirty-sync effect pays one resync the first time
    // isDirty settles. Let that happen and clear it here so it doesn't
    // conflate with the desync scenario below.
    const settleInput = screen.getByTestId('b');
    fireEvent.change(settleInput, { target: { value: 'settle' } });
    fireEvent.change(settleInput, { target: { value: '' } });
    getDirtyFieldsSpy.mockClear();

    // Bypasses updateTouchAndDirty (no shouldDirty), desyncing dirtyFields
    // from the actual value of 'a'.
    act(() => {
      (window as any).__setValueA();
    });

    expect(getDirtyFieldsSpy).not.toHaveBeenCalled();

    const input = screen.getByTestId('b');

    fireEvent.change(input, { target: { value: 'x' } });

    // First edit after the desync must reconcile the whole tree so 'a'
    // surfaces in dirtyFields too. This form subscribes to both isDirty and
    // dirtyFields, and the out-of-band setValue desynced both of their
    // independent caches, so both rebuild here (2 calls, not 1).
    expect(getDirtyFieldsSpy).toHaveBeenCalledTimes(2);

    getDirtyFieldsSpy.mockClear();

    for (const char of 'yz'.split('')) {
      fireEvent.change(input, { target: { value: 'x' + char } });
    }

    // Once resynced, further scalar edits go back to the O(1) fast path.
    expect(getDirtyFieldsSpy).not.toHaveBeenCalled();
  });

  it('notifies dirtyFields subscribers when a recompute reconciles another field, even if the edited field stays dirty', () => {
    let capturedDirtyFields: Record<string, unknown> = {};

    function Form() {
      const { register, setValue, formState } = useForm({
        defaultValues: { a: '', b: '' },
      });
      capturedDirtyFields = formState.dirtyFields;
      (window as any).__setValueB = () => setValue('b', 'changed');
      return (
        <form>
          <input {...register('a')} data-testid="a" />
          <input {...register('b')} data-testid="b" />
        </form>
      );
    }

    render(<Form />);

    // Make 'a' dirty first — its own dirty flag will stay `true` through
    // the next edit below, so a naive per-field comparison sees no change.
    fireEvent.change(screen.getByTestId('a'), { target: { value: 'x' } });
    expect(capturedDirtyFields).toHaveProperty('a');
    expect(capturedDirtyFields).not.toHaveProperty('b');

    // Desyncs 'b' from dirtyFields without going through updateTouchAndDirty.
    act(() => {
      (window as any).__setValueB();
    });

    // Edit 'a' again: isCurrentFieldPristine is false both before and after,
    // so the per-field fast-path comparison alone would see no change — the
    // recompute must still be treated as an update so 'b' reaches the render.
    fireEvent.change(screen.getByTestId('a'), { target: { value: 'xy' } });

    expect(capturedDirtyFields).toHaveProperty('a');
    expect(capturedDirtyFields).toHaveProperty('b');
  });

  it('handles 300 keystrokes on one field of a 100-field form within budget regardless of form size', () => {
    const names = Array.from({ length: 100 }, (_, i) => `f${i}`);

    function Form() {
      const { register, formState } = useForm({
        defaultValues: Object.fromEntries(names.map((n) => [n, ''])) as Record<
          string,
          string
        >,
      });
      void formState.isDirty;
      void formState.dirtyFields;
      return (
        <form>
          {names.map((n) => (
            <input key={n} {...register(n as any)} data-testid={n} />
          ))}
        </form>
      );
    }

    render(<Form />);
    const input = screen.getByTestId('f0');

    // Registration leaves the separate _getDirty dirty-name cache desynced,
    // so useForm's isDirty-sync effect pays one resync the first time
    // isDirty settles after mount — exclude that one-time cost below.
    fireEvent.change(input, { target: { value: '0' } });
    getDirtyFieldsSpy.mockClear();

    const t0 = performance.now();
    for (let i = 1; i < 300; i++) {
      fireEvent.change(input, { target: { value: String(i) } });
    }
    expect(performance.now() - t0).toBeLessThan(BUDGET_MS);
    expect(getDirtyFieldsSpy).not.toHaveBeenCalled();
  });
});

describe('isDirty proxy guard', () => {
  it('does not include isDirty in state notification when nothing subscribes to isDirty', () => {
    let control: any;

    function Form() {
      const { register, control: c } = useForm({
        defaultValues: { name: 'default' },
      });
      control = c;
      return <input {...register('name')} data-testid="name" />;
    }

    render(<Form />);

    const nextSpy = jest.spyOn(control._subjects.state, 'next');

    fireEvent.change(screen.getByTestId('name'), { target: { value: 'x' } });

    const emits = nextSpy.mock.calls.map(([p]) => p);
    expect(emits.every((p: any) => !('isDirty' in p))).toBe(true);
  });

  it('includes isDirty in state notification when subscribed', async () => {
    let control: any;

    function Form() {
      const {
        register,
        formState,
        control: c,
      } = useForm({
        defaultValues: { name: 'default' },
      });
      control = c;
      void formState.isDirty;
      return <input {...register('name')} data-testid="name" />;
    }

    render(<Form />);

    const nextSpy = jest.spyOn(control._subjects.state, 'next');

    fireEvent.change(screen.getByTestId('name'), { target: { value: 'x' } });

    const emits = nextSpy.mock.calls.map(([p]) => p);
    expect(emits.some((p: any) => 'isDirty' in p && p.isDirty === true)).toBe(
      true,
    );
  });
});

describe('_setValid optimization', () => {
  const BUDGET_MS = 3_000;

  it('skips full re-validation on no-rule fields when form is valid (500 changes within budget)', () => {
    const names = Array.from({ length: 50 }, (_, i) => `f${i}`);

    function Form() {
      const { register, formState } = useForm({
        defaultValues: Object.fromEntries(names.map((n) => [n, ''])) as Record<
          string,
          string
        >,
      });
      void formState.isValid;
      return (
        <form>
          {names.map((n) => (
            <input key={n} {...register(n as any)} data-testid={n} />
          ))}
        </form>
      );
    }

    render(<Form />);

    // Form starts valid (no rules on any field). 500 changes should skip
    // executeBuiltInValidation entirely and complete well within budget.
    const t0 = performance.now();
    for (let i = 0; i < 500; i++) {
      fireEvent.change(screen.getByTestId('f0'), {
        target: { value: String(i) },
      });
    }
    expect(performance.now() - t0).toBeLessThan(BUDGET_MS);
  });

  it('updates isValid correctly when a no-rule field change unmounts an invalid required field', async () => {
    let capturedIsValid = false;

    function Form() {
      const { register, control, formState } = useForm({
        mode: 'all',
        defaultValues: { toggle: false, required: '' },
      });
      capturedIsValid = formState.isValid;
      const toggleValue = useWatch({ control, name: 'toggle' });
      return (
        <form>
          <input type="checkbox" {...register('toggle')} data-testid="toggle" />
          {toggleValue && (
            <input
              {...register('required', { required: true })}
              data-testid="required"
            />
          )}
        </form>
      );
    }

    render(<Form />);

    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle'));
    });

    await waitFor(() => expect(capturedIsValid).toBe(false));

    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle'));
    });

    await waitFor(() => expect(capturedIsValid).toBe(true));
  });
});

describe('Re-render efficiency', () => {
  it('does not re-render the form parent when a child useWatch re-renders', () => {
    let parentRenders = 0;
    let childRenders = 0;

    const Child = ({
      control,
    }: {
      control: Control<{ a: string; b: string }>;
    }) => {
      useWatch({ control, name: 'a' });
      childRenders++;
      return <div />;
    };

    const Parent = () => {
      const { register, control } = useForm({
        defaultValues: { a: '', b: '' },
      });
      parentRenders++;
      return (
        <>
          <Child control={control} />
          <input {...register('a')} data-testid="a" />
          <input {...register('b')} data-testid="b" />
        </>
      );
    };

    render(<Parent />);

    const pBefore = parentRenders;
    const cBefore = childRenders;

    fireEvent.change(screen.getByTestId('a'), { target: { value: 'changed' } });

    expect(childRenders - cBefore).toBeGreaterThan(0);
    expect(parentRenders - pBefore).toBe(0);
  });

  it('does not re-render a useWatch component when an unwatched field changes', () => {
    let watcherRenders = 0;

    const Watcher = ({
      control,
    }: {
      control: Control<{ a: string; b: string }>;
    }) => {
      useWatch({ control, name: 'a' });
      watcherRenders++;
      return <div />;
    };

    const Parent = () => {
      const { register, control } = useForm({
        defaultValues: { a: '', b: '' },
      });
      return (
        <>
          <Watcher control={control} />
          <input {...register('a')} data-testid="a" />
          <input {...register('b')} data-testid="b" />
        </>
      );
    };

    render(<Parent />);
    const before = watcherRenders;

    fireEvent.change(screen.getByTestId('b'), { target: { value: 'x' } });

    expect(watcherRenders - before).toBe(0);
  });
});

describe('setValues emission batching', () => {
  it('emits exactly one state notification regardless of how many fields change', async () => {
    const names = Array.from({ length: 20 }, (_, i) => `f${i}`);

    const { result } = renderHook(() =>
      useForm({
        defaultValues: Object.fromEntries(names.map((n) => [n, ''])) as Record<
          string,
          string
        >,
      }),
    );

    for (const n of names) {
      result.current.register(n as any);
    }

    let emitCount = 0;
    const sub = (result.current as any).control._subjects.state.subscribe({
      next: () => emitCount++,
    });

    await act(async () => {
      result.current.setValues(
        Object.fromEntries(names.map((n) => [n, 'x'])) as any,
      );
    });

    sub.unsubscribe();

    expect(emitCount).toBe(1);
  });

  it('delivers correct values and dirty state after batched setValues', async () => {
    let capturedDirtyFields: Record<string, unknown> = {};

    function Form() {
      const { register, setValues, formState } = useForm({
        defaultValues: { a: '', b: '', c: '' },
      });
      capturedDirtyFields = formState.dirtyFields;
      React.useEffect(() => {
        register('a');
        register('b');
        register('c');
      }, [register]);
      return (
        <button
          onClick={() =>
            setValues({ a: 'x', b: 'y', c: '' }, { shouldDirty: true })
          }
        >
          set
        </button>
      );
    }

    render(<Form />);

    await act(async () => {
      fireEvent.click(screen.getByText('set'));
    });

    expect(capturedDirtyFields).toHaveProperty('a');
    expect(capturedDirtyFields).toHaveProperty('b');
    expect(capturedDirtyFields).not.toHaveProperty('c');
  });
});

describe('setValues _valuesSubscriberCount guard', () => {
  it('omits values from the broadcast when no watch(fn) subscriber is active', async () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { a: '', b: '' } }),
    );

    result.current.register('a' as any);
    result.current.register('b' as any);

    const control = result.current.control as any;
    const nextSpy = jest.spyOn(control._subjects.state, 'next');

    await act(async () => {
      result.current.setValues({ a: 'x', b: 'y' } as any);
    });

    const emits = nextSpy.mock.calls.map(([p]) => p);
    expect(emits.every((p: any) => !('values' in p))).toBe(true);
  });

  it('includes values in the broadcast when a watch(fn) subscriber is active', async () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { a: '', b: '' } }),
    );

    result.current.register('a' as any);
    result.current.register('b' as any);

    const watchSub = result.current.watch(() => {});
    const control = result.current.control as any;
    const nextSpy = jest.spyOn(control._subjects.state, 'next');

    await act(async () => {
      result.current.setValues({ a: 'x', b: 'y' } as any);
    });

    watchSub.unsubscribe();

    const emits = nextSpy.mock.calls.map(([p]) => p);
    expect(emits.some((p: any) => 'values' in p)).toBe(true);
  });
});

describe('_valuesSubscriberCount idempotency', () => {
  it('does not go negative when watch(fn) unsubscribe is called twice', () => {
    let control: any;
    let watchFn: any;

    function Form() {
      const {
        register,
        watch,
        control: c,
      } = useForm({
        defaultValues: { name: '' },
      });
      control = c;
      watchFn = watch;
      return <input {...register('name')} data-testid="name" />;
    }

    render(<Form />);

    const sub = watchFn(() => {});
    sub.unsubscribe();
    sub.unsubscribe();

    const nextSpy = jest.spyOn(control._subjects.state, 'next');
    fireEvent.change(screen.getByTestId('name'), { target: { value: 'x' } });

    const emits = nextSpy.mock.calls
      .map(([p]: [any]) => p)
      .filter((p: any) => p != null && typeof p === 'object' && 'type' in p);
    expect(emits.length).toBeGreaterThan(0);
    expect(emits.every((p: any) => !('values' in p))).toBe(true);
  });
});
