import * as React from 'react';
import useForm from './';
import { mount } from 'enzyme';
import detectRegistered from './logic/detectRegistered';
import attachEventListeners from './logic/attachEventListeners';

jest.mock('./logic/getFieldsValues');
jest.mock('./logic/getFieldValue');
jest.mock('./utils/onDomRemove');
jest.mock('./logic/validateField');
jest.mock('./logic/findMissDomAndClean');
jest.mock('./logic/detectRegistered');
jest.mock('./logic/removeAllEventListeners');
jest.mock('./utils/onDomRemove');
jest.mock('./logic/attachEventListeners');

describe('', () => {
  it('', () => {
    let tempRegister;
    function Test() {
      const { register } = useForm();
      tempRegister = register;
      return (
        <div>
          <input name="test" ref={ref => register({ ref })} />
        </div>
      );
    }

    mount(<Test />);
    expect(detectRegistered).toBeCalled();

  });
});
