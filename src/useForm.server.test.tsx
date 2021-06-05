import * as React from 'react';
import { renderToString } from 'react-dom/server';

import { useForm } from './useForm';

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
});
