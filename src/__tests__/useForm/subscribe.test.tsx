import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { useForm } from '../../useForm';

describe('subscribe', () => {
  it('should properly handle multiple subscriptions', async () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();

    function ChildComp({ subscribe }: { subscribe: any }) {
      React.useEffect(() => {
        return subscribe({
          formState: {
            dirtyFields: true,
          },
          name: 'first',
          callback: cb2,
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
          callback: cb1,
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

    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb1).toHaveBeenCalledTimes(0);

    fireEvent.input(screen.getAllByRole('textbox')[1], {
      target: { name: 'sec', value: 'test' },
    });

    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb1).toHaveBeenCalledTimes(1);
  });
});
