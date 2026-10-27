import React from 'react';
import { renderToString } from 'react-dom/server';

import { useForm } from '../useForm';

describe('useForm with SSR', () => {
  it('not output error', () => {
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

    expect(renderToString(<Component />)).toEqual(
      '<div><input name="test"/></div>',
    );

    expect(spy).not.toHaveBeenCalled();
  });

  it('display error with errors prop', () => {
    const App = () => {
      const {
        register,
        formState: { errors },
      } = useForm<{
        test: string;
      }>({
        errors: {
          test: { type: 'test', message: 'test error' },
        },
      });

      return (
        <div>
          <input {...register('test')} />
          <span role="alert">{errors.test && errors.test.message}</span>
        </div>
      );
    };

    expect(renderToString(<App />)).toEqual(
      '<div><input name="test"/><span role="alert">test error</span></div>',
    );
  });

  it('not pass down constrained API for server side rendering', () => {
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

    expect(renderToString(<App />)).toEqual('<div><input name="test"/></div>');
  });

  it('pass down constrained API for server side rendering', () => {
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

    expect(renderToString(<App />)).toEqual('<div><input name="test"/></div>');
  });

  it('support progress enhancement for form', () => {
    const App = () => {
      const { register } = useForm<{
        test: string;
      }>({
        progressive: true,
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

    expect(renderToString(<App />)).toEqual(
      '<div><input required="" min="2" max="2" minLength="2" maxLength="2" name="test"/></div>',
    );
  });

  it('only output the required attribute when the required rule is on with progressive', () => {
    const App = () => {
      const { register } = useForm<{
        off: string;
        on: string;
        message: string;
      }>({
        progressive: true,
      });

      return (
        <div>
          <input
            {...register('off', {
              required: { value: false, message: 'off is required' },
            })}
          />
          <input
            {...register('on', {
              required: { value: true, message: 'on is required' },
            })}
          />
          <input
            {...register('message', { required: 'message is required' })}
          />
        </div>
      );
    };

    expect(renderToString(<App />)).toEqual(
      '<div><input name="off"/><input required="" name="on"/><input required="" name="message"/></div>',
    );
  });
});
