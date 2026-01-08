import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import type { UseFormSubscribe } from '../../types';
import { useForm } from '../../useForm';
import { useFormState } from '../../useFormState';

describe('subscribe', () => {
  it('should properly handle multiple subscriptions', async () => {
    const callbackFn1 = jest.fn();
    const callbackFn2 = jest.fn();

    function ChildComp({
      subscribe,
    }: {
      subscribe: UseFormSubscribe<{
        first: string;
        sec: string;
      }>;
    }) {
      React.useEffect(() => {
        return subscribe({
          formState: {
            dirtyFields: true,
          },
          name: 'first',
          callback: callbackFn2,
        });
      }, [subscribe]);
      return null;
    }
    const App = () => {
      const { register, subscribe } = useForm({
        defaultValues: {
          first: '',
          sec: '',
        },
      });

      React.useEffect(() => {
        return subscribe({
          formState: {
            values: true,
          },
          name: 'sec',
          callback: callbackFn1,
        });
      }, [subscribe]);
      return (
        <form>
          <input {...register('first')} />
          <input {...register('sec')} />
          <ChildComp subscribe={subscribe} />
        </form>
      );
    };
    render(<App />);

    fireEvent.input(screen.getAllByRole('textbox')[0], {
      target: { name: 'first', value: 'test' },
    });

    expect(callbackFn2).toHaveBeenCalledTimes(1);
    expect(callbackFn1).toHaveBeenCalledTimes(0);

    fireEvent.input(screen.getAllByRole('textbox')[1], {
      target: { name: 'sec', value: 'test' },
    });

    expect(callbackFn2).toHaveBeenCalledTimes(1);
    expect(callbackFn1).toHaveBeenCalledTimes(1);
  });

  it('should only react to formState changes it subscribes to', async () => {
    const callbackFn = jest.fn();

    const App = () => {
      const { register, subscribe, control } = useForm({
        defaultValues: {
          first: '',
          sec: '',
        },
      });

      const fieldFormState = useFormState({
        name: 'first',
        control,
      });

      fieldFormState.touchedFields;

      React.useEffect(() => {
        return subscribe({
          formState: {
            values: true,
          },
          name: 'sec',
          callback: callbackFn,
        });
      }, [subscribe]);

      return (
        <form>
          <input {...register('first')} />
          <input {...register('sec')} />
        </form>
      );
    };
    render(<App />);

    fireEvent.blur(screen.getAllByRole('textbox')[1]);

    fireEvent.input(screen.getAllByRole('textbox')[1], {
      target: { value: 'test' },
    });

    fireEvent.input(screen.getAllByRole('textbox')[1], {
      target: { value: 'test2' },
    });

    expect(callbackFn).toHaveBeenCalledTimes(2);
  });
});
