import * as React from 'react';
import useForm from './';
import { mount } from 'enzyme';
import detectRegistered from './logic/detectRegistered';

jest.mock('./logic/getFieldsValues');
jest.mock('./logic/getFieldValue');
jest.mock('./utils/onDomRemove');
jest.mock('./logic/findMissDomAndClean');
jest.mock('./logic/detectRegistered');
jest.mock('./logic/removeAllEventListeners');
jest.mock('./utils/onDomRemove');

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
  });

  it('should handle submit when there is no error', () => {
    const onSubmit = jest.fn();

    function Test() {
      const { register, handleSubmit } = useForm();
      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="radio" name="test" ref={ref => register({ ref })} />
          <input type="radio" name="test1" ref={ref => register({ ref })} />
          <input type="radio" name="test2" ref={ref => register({ ref })} />
          <input type="radio" name="test3" ref={ref => register({ ref })} />
          <input type="radio" name="test4" ref={ref => register({ ref })} />
        </form>
      );
    }

    const tree = mount(<Test />);
    tree
      .find('form')
      .at(0)
      .simulate('submit');
    expect(onSubmit).toBeCalled();
  });

  it('should remove all event listeners when mode changes', () => {
    const onSubmit = jest.fn();

    function Test({ mode = 'onChange' }) {
      // @ts-ignore
      const { register, handleSubmit, errors } = useForm({ mode });
      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="text" name="test" ref={ref => register({ ref, required: true })} />
          {errors.test && errors.test.required && <span>error</span>}
          <input type="text" value="2" name="test1" ref={ref => register({ ref })} />
          <input type="text" name="test2" ref={ref => register({ ref })} />
          <input type="text" name="test3" ref={ref => register({ ref })} />
          <input type="text" name="test4" ref={ref => register({ ref })} />
        </form>
      );
    }

    const tree = mount(<Test />);
    tree
      .find('form')
      .at(0)
      .simulate('submit');
    expect(onSubmit).not.toBeCalled();
  });
});
