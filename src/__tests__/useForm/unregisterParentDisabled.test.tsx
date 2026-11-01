import React from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';

import { useForm } from '../../useForm';

describe('unregister a parent with disabled descendants', () => {
  it('submits retained descendants without stripping formerly disabled values', async () => {
    const onSubmit = jest.fn();
    const App = () => {
      const [shown, setShown] = React.useState(true);
      const { register, unregister, handleSubmit } = useForm({
        defaultValues: { parent: { child: 'kept' }, parentOther: 'sibling' },
      });
      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          {shown && <input {...register('parent.child', { disabled: true })} />}
          <input {...register('parentOther')} />
          <button
            type="button"
            onClick={() => {
              setShown(false);
              unregister('parent', { keepValue: true });
            }}
          >
            hide
          </button>
          <button>submit</button>
        </form>
      );
    };
    render(<App />);
    fireEvent.click(screen.getByText('hide'));
    await act(async () => fireEvent.click(screen.getByText('submit')));
    expect(onSubmit).toHaveBeenCalledWith(
      { parent: { child: 'kept' }, parentOther: 'sibling' },
      expect.any(Object),
    );
  });
  it.each(['parent', 'parent.child', 'rows'])(
    'clears disabled descendants of %s without matching similarly prefixed siblings',
    async (name) => {
      const { result } = renderHook(() =>
        useForm({
          defaultValues: {
            parent: { child: { value: 'kept' } },
            parentOther: 'disabled',
            rows: [{ value: 'array' }],
          },
        }),
      );
      act(() => {
        for (const field of [
          'parent.child.value',
          'parentOther',
          'rows.0.value',
        ] as const) {
          result.current.register(field, { disabled: true });
          result.current.register(field, { disabled: true });
        }
        result.current.unregister(name as 'parent' | 'parent.child' | 'rows', {
          keepValue: true,
        });
      });
      const submitted = jest.fn();
      await act(async () => result.current.handleSubmit(submitted)());
      expect(submitted.mock.calls[0][0]).toEqual(
        name === 'rows'
          ? { rows: [{ value: 'array' }] }
          : { parent: { child: { value: 'kept' } } },
      );
    },
  );

  it('stops validating descendants when a parent is unregistered with keepValue', async () => {
    const validate = jest.fn(() => 'invalid');
    const { result } = renderHook(() =>
      useForm({ defaultValues: { parent: { child: 'kept' } } }),
    );
    act(() => {
      result.current.register('parent.child', { validate });
      result.current.unregister('parent', { keepValue: true });
    });
    expect(await result.current.trigger()).toBe(true);
    expect(validate).not.toHaveBeenCalled();
    expect(result.current.getValues()).toEqual({ parent: { child: 'kept' } });
  });
});
