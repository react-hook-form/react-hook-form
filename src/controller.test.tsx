import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Controller } from './index';

describe('React Hook Form Input', () => {
  it('should render correctly with as with string', () => {
    const { asFragment } = render(
      <Controller
        name="test"
        as="input"
        control={{
          defaultValues: {},
          fields: {},
          setValue: jest.fn(),
          register: jest.fn(),
          unregister: jest.fn(),
          errors: {},
          mode: { isOnSubmit: false, isOnBlur: false },
          reValidateMode: {
            isReValidateOnBlur: false,
            isReValidateOnSubmit: false,
          },
          formState: { isSubmitted: false },
        }}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with as with component', () => {
    const { asFragment } = render(
      <Controller
        name="test"
        as={<input />}
        control={{
          defaultValues: {},
          fields: {},
          setValue: jest.fn(),
          register: jest.fn(),
          unregister: jest.fn(),
          errors: {},
          mode: { isOnSubmit: false, isOnBlur: false },
          reValidateMode: {
            isReValidateOnBlur: false,
            isReValidateOnSubmit: false,
          },
          formState: { isSubmitted: false },
        }}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("should trigger component's onChange method and invoke setValue method", () => {
    const setValue = jest.fn();

    const { getByPlaceholderText } = render(
      <Controller
        name="test"
        as={<input placeholder="test" />}
        control={{
          defaultValues: {},
          fields: {},
          setValue,
          register: jest.fn(),
          unregister: jest.fn(),
          errors: {},
          mode: { isOnSubmit: true, isOnBlur: false },
          reValidateMode: {
            isReValidateOnBlur: false,
            isReValidateOnSubmit: false,
          },
          formState: { isSubmitted: false },
        }}
      />,
    );

    fireEvent.change(getByPlaceholderText('test'), {
      target: {
        value: 'test',
      },
    });

    expect(setValue).toBeCalledWith('test', 'test', false);
  });

  it("should trigger component's onBlur method and invoke setValue method", () => {
    const setValue = jest.fn();

    const { getByPlaceholderText } = render(
      <Controller
        name="test"
        as={<input placeholder="test" />}
        control={{
          defaultValues: {},
          fields: {},
          setValue,
          register: jest.fn(),
          unregister: jest.fn(),
          errors: {},
          mode: { isOnSubmit: true, isOnBlur: true },
          reValidateMode: {
            isReValidateOnBlur: false,
            isReValidateOnSubmit: false,
          },
          formState: { isSubmitted: false },
        }}
      />,
    );

    fireEvent.blur(getByPlaceholderText('test'), {
      target: {
        value: 'test',
      },
    });

    expect(setValue).toBeCalledWith('test', 'test', false);
  });

  it('should invoke custom event named method', () => {
    const setValue = jest.fn();

    const { getByPlaceholderText } = render(
      <Controller
        name="test"
        as={<input placeholder="test" />}
        onChangeName="onChange"
        control={{
          defaultValues: {},
          setValue,
          fields: {},
          register: jest.fn(),
          unregister: jest.fn(),
          errors: {},
          mode: { isOnSubmit: true, isOnBlur: true },
          reValidateMode: {
            isReValidateOnBlur: false,
            isReValidateOnSubmit: false,
          },
          formState: { isSubmitted: false },
        }}
      />,
    );

    fireEvent.blur(getByPlaceholderText('test'), {
      target: {
        value: 'test',
      },
    });

    expect(setValue).toBeCalledWith('test', 'test', false);
  });

  it('should invoke custom onChange method', () => {
    const onChange = jest.fn();
    const setValue = jest.fn();

    onChange.mockImplementation(() => 'test');

    const { getByPlaceholderText } = render(
      <Controller
        name="test"
        as={<input placeholder="test" />}
        onChange={onChange}
        control={{
          defaultValues: {},
          fields: {},
          setValue,
          register: jest.fn(),
          unregister: jest.fn(),
          errors: {},
          mode: { isOnSubmit: false, isOnBlur: true },
          reValidateMode: {
            isReValidateOnBlur: false,
            isReValidateOnSubmit: false,
          },
          formState: { isSubmitted: false },
        }}
      />,
    );

    fireEvent.change(getByPlaceholderText('test'), {
      target: {
        value: 'test',
      },
    });

    expect(setValue).toBeCalled();
    expect(onChange).toBeCalled();
  });

  it('should support default value from hook form', () => {
    const { asFragment } = render(
      <Controller
        name="test"
        as="input"
        control={{
          defaultValues: {
            test: 'data',
          },
          fields: {},
          setValue: jest.fn(),
          register: jest.fn(),
          unregister: jest.fn(),
          errors: {},
          mode: { isOnSubmit: false, isOnBlur: false },
          reValidateMode: {
            isReValidateOnBlur: false,
            isReValidateOnSubmit: false,
          },
          formState: { isSubmitted: false },
        }}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
