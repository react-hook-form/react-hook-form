import * as React from 'react';
import { renderToString } from 'react-dom/server';

import { useForm } from '../useForm';

describe('useForm with SSR', () => {
  it('should not output error', () => {
    const Component = () => {
      const { register } = useForm<{
        test: string;
      }>();
      return (
        <div>
          <input {...register('test')} />
        </div>
      );
    };

    const spy = jest.spyOn(console, 'error');

    expect(renderToString(<Component />)).toMatchSnapshot();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not pass down constrained API for server side rendering', () => {
    const App = () => {
      const { register } = useForm<{
        test: string;
      }>();

      return (
        <div>
          <input
            {...register('test', {
              required: true,
              min: 2,
              max: 2,
              maxLength: 2,
              minLength: 2,
            })}
          />
        </div>
      );
    };

    expect(renderToString(<App />)).toMatchSnapshot();
  });

  it('should pass down constrained API for server side rendering', () => {
    const App = () => {
      const { register } = useForm<{
        test: string;
      }>({
        shouldUseNativeValidation: true,
      });

      return (
        <div>
          <input
            {...register('test', {
              required: true,
              min: 2,
              max: 2,
              maxLength: 2,
              minLength: 2,
            })}
          />
        </div>
      );
    };

    expect(renderToString(<App />)).toMatchSnapshot();
  });
});
