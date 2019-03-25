import * as React from 'react';
import useForm from '.';
import { mount } from 'enzyme';

jest.mock('./logic/getFieldsValues');
jest.mock('./logic/getFieldValue');
jest.mock('./utils/onDomRemove');
jest.mock('./logic/findMissDomAndClean');
jest.mock('./logic/removeAllEventListeners');
jest.mock('./utils/onDomRemove');

describe('useForm', () => {
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
});
