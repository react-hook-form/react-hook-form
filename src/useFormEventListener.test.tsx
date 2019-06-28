import useForm from './index';
import * as React from 'react';
// @ts-ignore
import * as ReactDOM from 'react-dom';
import { act } from 'react-test-renderer';

jest.mock('./utils/onDomRemove');

describe('useFormEventListeners', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return error type correctly and update form state', () => {
    let container = document.createElement('div');
    // @ts-ignore
    let hook;
    document.body.appendChild(container);
    const TestHook = () => {
      hook = useForm({});
      hook.watch();
      return <input name="test" ref={hook.register({ required: true })} />;
    };

    ReactDOM.render(<TestHook />, container);

    act(() => {
      const input = document.querySelector('input');
      // @ts-ignore
      input.dispatchEvent(new Event('input'));
    });

    // @ts-ignore
    expect(hook.formState).toMatchSnapshot();
  });

  it('should skip when field is not included in the validationFields', () => {
    let container = document.createElement('div');
    // @ts-ignore
    let hook;
    document.body.appendChild(container);
    const TestHook = () => {
      hook = useForm({
        validationFields: ['nothing'],
      });
      hook.watch();
      return <input name="test" ref={hook.register({ required: true })} />;
    };

    ReactDOM.render(<TestHook />, container);

    act(() => {
      const input = document.querySelector('input');
      // @ts-ignore
      input.dispatchEvent(new Event('input'));
    });

    // @ts-ignore
    expect(hook.formState).toMatchSnapshot();
  });
});
