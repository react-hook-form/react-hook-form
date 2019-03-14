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

describe('useForm', () => {
  it('should detect event listeners and attach events', () => {
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

  it('should detect event listeners and attach events', () => {
    let tempRegister;
    function Test() {
      const { register } = useForm({
        mode: 'onChange',
      });
      tempRegister = register;
      return (
        <div>
          <input name="test" ref={ref => register({ ref })} />
        </div>
      );
    }

    mount(<Test />);
    expect(detectRegistered).toBeCalled();
    expect(attachEventListeners).toBeCalled();
  });

  it('should detect event listeners and attach events for radio inputs', () => {
    let tempRegister;
    function Test() {
      const { register } = useForm();
      tempRegister = register;
      return (
        <div>
          <input type="radio" name="test" ref={ref => register({ ref })} />
          <input type="radio" name="test1" ref={ref => register({ ref })} />
          <input type="radio" name="test2" ref={ref => register({ ref })} />
          <input type="radio" name="test3" ref={ref => register({ ref })} />
          <input type="radio" name="test4" ref={ref => register({ ref })} />
        </div>
      );
    }

    mount(<Test />);
    expect(detectRegistered).toBeCalled();
    expect(attachEventListeners).toBeCalled();
  });
});
