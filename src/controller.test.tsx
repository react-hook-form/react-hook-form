import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Controller } from './controller';
import { reconfigureControl } from './useForm.test';
import { Field } from './types';

describe('Controller', () => {
  it('should render correctly with as with string', () => {
    const control = reconfigureControl();
    const fieldsRef = {
      current: {},
    };

    const { asFragment } = render(
      <Controller
        defaultValue=""
        name="test"
        as={'input' as 'input'}
        control={
          {
            ...control,
            register: (payload: any) => {
              // @ts-ignore
              fieldsRef.current[payload.name] = 'test';
            },
            fieldsRef,
          } as any
        }
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with as with component', () => {
    const control = reconfigureControl();
    const fieldsRef = {
      current: {},
    };

    const { asFragment } = render(
      <Controller
        defaultValue=""
        name="test"
        as={<input />}
        control={
          {
            ...control,
            register: (payload: any) => {
              // @ts-ignore
              fieldsRef.current[payload.name] = 'test';
            },
            fieldsRef,
          } as any
        }
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("should trigger component's onChange method and invoke setValue method", () => {
    const setValue = jest.fn();
    const control = reconfigureControl({
      setValue,
      mode: { isOnSubmit: true, isOnBlur: false },
    });
    const fieldsRef = {
      current: {},
    };

    const { getByPlaceholderText } = render(
      <Controller
        defaultValue=""
        name="test"
        as={<input placeholder="test" />}
        control={
          {
            ...control,
            register: (payload: any) => {
              // @ts-ignore
              fieldsRef.current[payload.name] = 'test';
            },
            fieldsRef,
          } as any
        }
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
    const triggerValidation = jest.fn();
    const control = reconfigureControl({
      triggerValidation,
      mode: { isOnSubmit: true, isOnBlur: true },
    });
    const fieldsRef = {
      current: {},
    };

    const { getByPlaceholderText } = render(
      <Controller
        defaultValue=""
        name="test"
        as={<input placeholder="test" />}
        control={
          {
            ...control,
            register: (payload: any) => {
              // @ts-ignore
              fieldsRef.current[payload.name] = 'test';
            },
            fieldsRef,
          } as any
        }
      />,
    );

    fireEvent.blur(getByPlaceholderText('test'), {
      target: {
        value: 'test',
      },
    });

    expect(triggerValidation).toBeCalledWith('test');
  });

  it('should invoke custom event named method', () => {
    const setValue = jest.fn();
    const control = reconfigureControl({
      setValue,
      mode: { isOnSubmit: true, isOnBlur: true },
    });
    const fieldsRef = {
      current: {},
    };

    const { getByPlaceholderText } = render(
      <Controller
        defaultValue=""
        name="test"
        as={<input placeholder="test" />}
        onChangeName="onChange"
        control={
          {
            ...control,
            register: (payload: any) => {
              // @ts-ignore
              fieldsRef.current[payload.name] = 'test';
            },
            fieldsRef,
          } as any
        }
      />,
    );

    fireEvent.change(getByPlaceholderText('test'), {
      target: {
        value: 'test',
      },
    });

    expect(setValue).toBeCalledWith('test', 'test', false);
  });

  it('should invoke custom onChange method', () => {
    const onChange = jest.fn();
    const setValue = jest.fn();
    const control = reconfigureControl({
      setValue,
      mode: { isOnSubmit: false, isOnBlur: true },
    });
    const fieldsRef = {
      current: {},
    };

    onChange.mockImplementation(() => 'test');

    const { getByPlaceholderText } = render(
      <Controller
        defaultValue=""
        name="test"
        as={<input placeholder="test" />}
        onChange={onChange}
        control={
          {
            ...control,
            register: (payload: any) => {
              // @ts-ignore
              fieldsRef.current[payload.name] = 'test';
            },
            fieldsRef,
          } as any
        }
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

  it('should invoke custom onBlur method', () => {
    const onBlur = jest.fn();
    const control = reconfigureControl({
      mode: { isOnSubmit: false, isOnBlur: true },
    });
    const fieldsRef = {
      current: {},
    };

    const { getByPlaceholderText } = render(
      <Controller
        defaultValue=""
        name="test"
        as={<input placeholder="test" />}
        onBlur={onBlur}
        control={
          {
            ...control,
            register: (payload: any) => {
              // @ts-ignore
              fieldsRef.current[payload.name] = 'test';
            },
            fieldsRef,
          } as any
        }
      />,
    );

    fireEvent.blur(getByPlaceholderText('test'), {
      target: {
        value: 'test',
      },
    });

    expect(onBlur).toBeCalled();
  });

  it('should support default value from hook form', () => {
    const control = reconfigureControl({
      defaultValuesRef: {
        current: {
          test: 'data',
        },
      },
    });
    const fieldsRef = {
      current: {},
    };

    const { asFragment } = render(
      <Controller
        name="test"
        as={'input' as 'input'}
        control={
          {
            ...control,
            register: (payload: any) => {
              // @ts-ignore
              fieldsRef.current[payload.name] = 'test';
            },
            fieldsRef,
          } as any
        }
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should support custom value name', () => {
    const control = reconfigureControl();
    const fieldsRef = {
      current: {},
    };

    const { asFragment } = render(
      <Controller
        defaultValue=""
        name="test"
        as={'input' as 'input'}
        valueName="selectedkey"
        control={
          {
            ...control,
            register: (payload: any) => {
              // @ts-ignore
              fieldsRef.current[payload.name] = 'test';
            },
            fieldsRef,
          } as any
        }
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should invoke removeFieldEventListener to remove field with Field Array item', () => {
    const control = reconfigureControl();
    const removeFieldEventListener = jest.fn();

    render(
      <Controller
        defaultValue=""
        name="test[0]"
        as={'input' as 'input'}
        valueName="selectedkey"
        control={{
          ...control,
          removeFieldEventListener,
          fieldsRef: {
            current: {
              'test[0]': {} as Field,
            },
          },
          fieldArrayNamesRef: {
            current: new Set(['test']),
          },
        }}
      />,
    );

    expect(removeFieldEventListener).toBeCalled();
  });
});
