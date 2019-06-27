import useForm from "./index";
import * as React from "react";
// @ts-ignore
import * as ReactDOM from 'react-dom';
import onDomRemove from './utils/onDomRemove';

jest.mock('./utils/onDomRemove');

describe.skip('validateAndStateUpdateRef', () => {
  it.only('', () => {
    let container = document.createElement('div');
    document.body.appendChild(container);
    const TestHook = () => {
      const { register } = useForm({
        mode: 'onChange',
      });
      return <input name="test" ref={register} />;
    };

    ReactDOM.render(<TestHook />, container);

    const input = document.querySelector('input');
    // @ts-ignore
    input.dispatchEvent(new Event('input'));

  });
});
