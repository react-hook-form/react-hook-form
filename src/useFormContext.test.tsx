import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { FormContext, useFormContext } from './useFormContext';
import { mount } from 'enzyme';

describe('FormContext', () => {
  it('should render correctly', () => {
    const tree = renderer.create(
      // @ts-ignore
      <FormContext>
        <div>child</div>
      </FormContext>,
    );
    expect(tree).toMatchSnapshot();
  });

  it('should have access to all methods with useFormContext', () => {
    const test = jest.fn();
    const Child = () => {
      // @ts-ignore
      const { test } = useFormContext();
      test();
      return null;
    };
    const TestHook = () => {
      return (
        // @ts-ignore
        <FormContext test={test}>
          <Child />
        </FormContext>
      );
    };

    mount(<TestHook />);

    expect(test).toBeCalled();
  });
});
