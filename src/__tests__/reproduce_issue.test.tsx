import React, { useEffect, useRef, useState } from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';

import { useForm } from '../useForm';
import { FormProvider, useFormContext } from '../useFormContext';
import { useWatch } from '../useWatch';

describe('useWatch reference stability', () => {
  it('should NOT trigger useEffect when handleSubmit runs without value changes (basic)', async () => {
    const fooEffectCount = { count: 0 };

    function Child() {
      const { handleSubmit, setValue } = useFormContext();
      const foo = useWatch({ name: 'foo' });
      const boo = useWatch({ name: 'boo' });
      const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

      useEffect(() => {
        if (!buttonRef) return;
        fooEffectCount.count++;
        setValue('boo', 'foo is changed');
      }, [foo]);

      return (
        <div>
          <button
            type="button"
            ref={setButtonRef}
            onClick={handleSubmit(() => {})}
          >
            Just submit
          </button>
          <div data-testid="boo">{boo}</div>
        </div>
      );
    }

    function App() {
      const methods = useForm({
        defaultValues: {
          boo: 'This is the default value of boo',
          foo: 'initial_foo_string',
        },
      });
      return (
        <FormProvider {...methods}>
          <Child />
        </FormProvider>
      );
    }

    render(<App />);
    expect(screen.getByTestId('boo').textContent).toBe(
      'This is the default value of boo',
    );
    fooEffectCount.count = 0;

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    await new Promise((r) => setTimeout(r, 100));

    expect(fooEffectCount.count).toBe(0);
    expect(screen.getByTestId('boo').textContent).toBe(
      'This is the default value of boo',
    );
  });

  it('should NOT change foo reference when setValue is called for a different field (object foo)', async () => {
    let fooReferenceChanged = false;
    let prevFooRef: unknown = null;

    function App() {
      const { control, setValue } = useForm({
        defaultValues: {
          foo: { nested: 'value' },
          boo: 'initial_boo',
        },
      });
      const foo = useWatch({ name: 'foo', control });

      // Track reference changes
      if (prevFooRef !== null && prevFooRef !== foo) {
        fooReferenceChanged = true;
      }
      prevFooRef = foo;

      useEffect(() => {
        // Trigger a setValue for a different field
        setValue('boo', 'boo changed');
      }, []);

      return (
        <div>
          <div data-testid="foo">{JSON.stringify(foo)}</div>
        </div>
      );
    }

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('foo').textContent).toBe(
        JSON.stringify({ nested: 'value' }),
      );
    });
    await new Promise((r) => setTimeout(r, 100));

    console.log('foo reference changed after setValue for different field:', fooReferenceChanged);
    // foo reference should NOT change when boo is updated
    expect(fooReferenceChanged).toBe(false);
  });

  it('should maintain stable foo reference across form re-renders (no value change)', async () => {
    let fooReferenceChanged = false;
    let fooValueCount = 0;
    let prevFooRef: unknown = null;

    function Child() {
      const { handleSubmit, setValue } = useFormContext();
      const foo = useWatch({ name: 'foo' });
      const boo = useWatch({ name: 'boo' });
      const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

      fooValueCount++;
      if (prevFooRef !== null && prevFooRef !== foo) {
        fooReferenceChanged = true;
      }
      prevFooRef = foo;

      useEffect(() => {
        if (!buttonRef) return;
        // effect depends on [foo] - should not fire unless foo actually changes
      }, [foo]);

      return (
        <div>
          <button
            type="button"
            ref={setButtonRef}
            onClick={handleSubmit(() => {})}
          >
            Just submit
          </button>
          <div data-testid="boo">{boo}</div>
        </div>
      );
    }

    function App() {
      const methods = useForm({
        defaultValues: {
          boo: 'This is the default value of boo',
          foo: { nested: 'value' },
        },
      });
      return (
        <FormProvider {...methods}>
          <Child />
        </FormProvider>
      );
    }

    render(<App />);
    fooReferenceChanged = false; // reset after initial setup

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    await new Promise((r) => setTimeout(r, 100));

    console.log('foo reference changed after handleSubmit:', fooReferenceChanged);
    expect(fooReferenceChanged).toBe(false);
  });
});
