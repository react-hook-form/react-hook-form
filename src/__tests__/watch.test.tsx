import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expectType } from 'tsd';

import { useForm } from '../useForm';
import { Watch } from '../watch';

type FormType = {
  foo: string;
  bar: string;
  baz: {
    qux: string;
  };
  quux: number;
  fie: null;
  foe: { qux: number[] };
};

describe('Watch', () => {
  it('should have correct types for render function parameters', () => {
    const Component = () => {
      const { control } = useForm<FormType>();
      return (
        <Watch
          control={control}
          names={[
            'foo',
            'bar',
            'baz',
            'baz.qux',
            'quux',
            'fie',
            'foe',
            'foe.qux',
            'foe.qux.0',
          ]}
          render={([
            foo,
            bar,
            baz,
            bazQux,
            quux,
            fie,
            foe,
            foeQux,
            foeQux0,
          ]) => {
            expectType<string>(foo);
            expectType<string>(bar);
            expectType<{ qux: string }>(baz);
            expectType<string>(bazQux);
            expectType<number>(quux);
            expectType<null>(fie);
            expectType<{ qux: number[] }>(foe);
            expectType<number[]>(foeQux);
            expectType<number>(foeQux0);
            return null;
          }}
        />
      );
    };

    Component;
  });

  it('should pass the values corresponding to the `names` prop to render function', () => {
    const Component = () => {
      const { control, register } = useForm<FormType>();
      return (
        <form>
          <input data-testid="foo" {...register('foo')} />
          <input data-testid="bar" {...register('bar')} />
          <input data-testid="baz_qux" {...register('baz.qux')} />
          <Watch
            control={control}
            names={['foo']}
            render={([foo]) => <span data-testid="fooText">{foo}</span>}
          />
          <Watch
            control={control}
            names={['bar']}
            render={([bar]) => <span data-testid="barText">{bar}</span>}
          />
          <Watch
            control={control}
            names={['baz.qux']}
            render={([bazQux]) => (
              <span data-testid="bazQuxText">{bazQux}</span>
            )}
          />
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');
    const barInput = screen.getByTestId('bar');
    const bazQuxInput = screen.getByTestId('baz_qux');
    const fooText = screen.getByTestId('fooText');
    const barText = screen.getByTestId('barText');
    const bazQuxText = screen.getByTestId('bazQuxText');

    fireEvent.input(fooInput, { target: { value: 'a' } });
    expect(fooText).toHaveTextContent('a');
    expect(barText).toHaveTextContent('');
    expect(bazQuxText).toHaveTextContent('');

    fireEvent.input(barInput, { target: { value: 'b' } });
    expect(fooText).toHaveTextContent('a');
    expect(barText).toHaveTextContent('b');
    expect(bazQuxText).toHaveTextContent('');

    fireEvent.input(bazQuxInput, { target: { value: 'c' } });
    expect(fooText).toHaveTextContent('a');
    expect(barText).toHaveTextContent('b');
    expect(bazQuxText).toHaveTextContent('c');
  });

  it('should trigger re-render only when the values corresponding to the `names` prop change', async () => {
    const outerCallback = jest.fn();
    const fooCallback = jest.fn();
    const barCallback = jest.fn();
    const bazQuxCallback = jest.fn();

    const OnRender = ({ callback }: { callback: () => void }) => {
      callback();
      return null;
    };

    const Component = () => {
      const { control, register } = useForm<FormType>();
      return (
        <form>
          <input data-testid="foo" {...register('foo')} />
          <input data-testid="bar" {...register('bar')} />
          <input data-testid="baz_qux" {...register('baz.qux')} />
          <OnRender callback={outerCallback} />
          <Watch
            control={control}
            names={['foo']}
            render={() => <OnRender callback={fooCallback} />}
          />
          <Watch
            control={control}
            names={['bar']}
            render={() => <OnRender callback={barCallback} />}
          />
          <Watch
            control={control}
            names={['baz.qux']}
            render={() => <OnRender callback={bazQuxCallback} />}
          />
        </form>
      );
    };

    render(<Component />);

    const fooInput = screen.getByTestId('foo');
    const barInput = screen.getByTestId('bar');
    const bazQuxInput = screen.getByTestId('baz_qux');

    fireEvent.input(fooInput, { target: { value: 'a' } });
    expect(outerCallback).toHaveBeenCalledTimes(2);
    expect(fooCallback).toHaveBeenCalledTimes(3);
    expect(barCallback).toHaveBeenCalledTimes(2);
    expect(bazQuxCallback).toHaveBeenCalledTimes(2);

    fireEvent.input(barInput, { target: { value: 'b' } });
    expect(outerCallback).toHaveBeenCalledTimes(2);
    expect(fooCallback).toHaveBeenCalledTimes(3);
    expect(barCallback).toHaveBeenCalledTimes(3);
    expect(bazQuxCallback).toHaveBeenCalledTimes(2);

    fireEvent.input(bazQuxInput, { target: { value: 'c' } });
    expect(outerCallback).toHaveBeenCalledTimes(2);
    expect(fooCallback).toHaveBeenCalledTimes(3);
    expect(barCallback).toHaveBeenCalledTimes(3);
    expect(bazQuxCallback).toHaveBeenCalledTimes(3);
  });
});
