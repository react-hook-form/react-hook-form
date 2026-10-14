import React from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';

import type { UseFormReturn } from '../types';
import { useForm } from '../useForm';
import { FormProvider, useFormContext } from '../useFormContext';

type FormValues = { test: string };

// Activity is a React 19.2+ API. Only run Activity-dependent tests when the
// installed React actually provides it.
const Activity = (React as unknown as { Activity?: unknown })
  .Activity as React.ComponentType<{
  mode: 'hidden' | 'visible';
  children?: React.ReactNode;
}>;
const itWithActivity = Activity ? it : it.skip;

function ChildWithMethods({
  watch,
  getErrors,
  formState,
}: Pick<UseFormReturn<FormValues>, 'watch' | 'getErrors' | 'formState'>) {
  return (
    <>
      <p>watch: {watch('test')}</p>
      <p>errors: {formState.errors.test?.message}</p>
      <p>getErrors: {getErrors('test')?.message}</p>
    </>
  );
}

function ContextChild() {
  const { watch, getFieldState, formState } = useFormContext<FormValues>();
  return (
    <>
      <p>context watch: {watch('test')}</p>
      <p>context invalid: {String(getFieldState('test', formState).invalid)}</p>
    </>
  );
}

function App() {
  const methods = useForm<FormValues>({ defaultValues: { test: '' } });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>
        <input
          {...methods.register('test', { required: 'required' })}
          placeholder="test"
        />
        <ChildWithMethods
          watch={methods.watch}
          getErrors={methods.getErrors}
          formState={methods.formState}
        />
        <ContextChild />
        <button>submit</button>
      </form>
    </FormProvider>
  );
}

describe('React Compiler compatibility', () => {
  it('should not serve stale values from memoized method calls', async () => {
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText('test'), {
      target: { value: 'abc' },
    });

    expect(await screen.findByText('watch: abc')).toBeVisible();
    expect(screen.getByText('context watch: abc')).toBeVisible();

    fireEvent.change(screen.getByPlaceholderText('test'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('errors: required')).toBeVisible();
    expect(screen.getByText('getErrors: required')).toBeVisible();
    expect(screen.getByText('context invalid: true')).toBeVisible();
  });

  it('should keep the methods object stable and refresh read methods', () => {
    const { result } = renderHook(() => {
      const methods = useForm<FormValues>();
      methods.formState.errors;
      return methods;
    });
    const methods = result.current;
    const first = { ...methods };

    act(() => {
      result.current.setError('test', { message: 'error' });
    });

    expect(result.current).toBe(methods);
    expect(result.current.watch).not.toBe(first.watch);
    expect(result.current.getValues).not.toBe(first.getValues);
    expect(result.current.getErrors).not.toBe(first.getErrors);
    expect(result.current.getFieldState).not.toBe(first.getFieldState);
    expect(result.current.register).not.toBe(first.register);
    expect(result.current.handleSubmit).toBe(first.handleSubmit);
    expect(result.current.setValue).toBe(first.setValue);
    expect(result.current.control).toBe(first.control);
  });

  it('should not nest bound methods across updates', () => {
    const { result } = renderHook(() => {
      const methods = useForm<FormValues>();
      methods.formState.errors;
      return methods;
    });

    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.setError('test', { message: `error ${i}` });
      });
    }

    expect(result.current.watch.name).toBe('bound watch');
    expect(result.current.getValues.name).toBe('bound getValues');
  });

  it('should update useFormContext formState when the provider parent is memoized', async () => {
    const Child = () => {
      const {
        formState: { errors },
        register,
        handleSubmit,
      } = useFormContext<FormValues>();

      return (
        <form onSubmit={handleSubmit(() => {})}>
          <input {...register('test', { required: 'required' })} />
          <p>{errors.test?.message}</p>
          <button>submit</button>
        </form>
      );
    };

    const Form = () => {
      const methods = useForm<FormValues>();

      return (
        <FormProvider {...methods}>
          <Child />
        </FormProvider>
      );
    };

    render(<Form />);

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('required')).toBeVisible();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'value' },
    });

    await waitFor(() =>
      expect(screen.queryByText('required')).not.toBeInTheDocument(),
    );
  });

  it('should keep useFormContext formState fresh when a descendant layout effect updates the form during a provider re-render', () => {
    const LayoutChild = ({ step }: { step: number }) => {
      const { setError } = useFormContext<FormValues>();

      React.useLayoutEffect(() => {
        if (step === 1) {
          setError('test', { message: 'from layout effect' });
        }
      }, [step, setError]);

      return null;
    };

    const Errors = () => {
      const { formState } = useFormContext<FormValues>();

      return <p>context: {formState.errors.test?.message ?? 'none'}</p>;
    };

    const Form = () => {
      const methods = useForm<FormValues>();
      const [step, setStep] = React.useState(0);

      return (
        <>
          <button
            onClick={() => {
              methods.setError('test', { message: 'from click' });
              setStep(1);
            }}
          >
            go
          </button>
          <p>root: {methods.formState.errors.test?.message ?? 'none'}</p>
          <FormProvider {...methods}>
            <LayoutChild step={step} />
            <Errors />
          </FormProvider>
        </>
      );
    };

    render(<Form />);

    fireEvent.click(screen.getByRole('button', { name: 'go' }));

    expect(screen.getByText('root: from layout effect')).toBeVisible();
    expect(screen.getByText('context: from layout effect')).toBeVisible();
  });

  itWithActivity(
    'should resync useFormContext formState after a hidden Activity subtree becomes visible',
    async () => {
      const Child = () => {
        const {
          formState: { errors },
        } = useFormContext<FormValues>();

        return <p>error: {errors.test?.message}</p>;
      };

      const Form = () => {
        const methods = useForm<FormValues>();
        const [mode, setMode] = React.useState<'hidden' | 'visible'>('visible');

        return (
          <>
            <button onClick={() => setMode('hidden')}>hide</button>
            <button
              onClick={() =>
                methods.setError('test', { message: 'set while hidden' })
              }
            >
              set error
            </button>
            <button onClick={() => setMode('visible')}>show</button>
            <Activity mode={mode}>
              <FormProvider {...methods}>
                <Child />
              </FormProvider>
            </Activity>
          </>
        );
      };

      render(<Form />);

      fireEvent.click(screen.getByRole('button', { name: 'hide' }));
      fireEvent.click(screen.getByRole('button', { name: 'set error' }));
      fireEvent.click(screen.getByRole('button', { name: 'show' }));

      expect(
        await screen.findByText('error: set while hidden'),
      ).toBeInTheDocument();
    },
  );

  it('should not loop when the methods object is an effect dependency', async () => {
    const onReset = jest.fn();

    const Form = () => {
      const form = useForm<FormValues>({ defaultValues: { test: '' } });

      React.useEffect(() => {
        onReset();
        form.reset({ test: 'reset' });
      }, [form]);

      return <p>{form.formState.isDirty ? 'dirty' : 'clean'}</p>;
    };

    render(<Form />);

    expect(await screen.findByText('clean')).toBeVisible();
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
