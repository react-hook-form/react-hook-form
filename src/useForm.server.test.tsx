/**
 * @jest-environment node
 */
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { useForm } from './useForm';

describe('useForm with SSR', () => {
  /**
   * This test should fail when you used useLayoutEffect
   */
  it('should not output error', () => {
    const Component = () => {
      const { register } = useForm();
      return (
        <div>
          <input ref={register} />
        </div>
      );
    };

    const spy = jest.spyOn(console, 'error');

    renderToString(<Component />);

    expect(spy).not.toHaveBeenCalled();
  });
});
