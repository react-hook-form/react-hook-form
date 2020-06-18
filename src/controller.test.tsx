import * as React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { Controller } from './controller';
import { reconfigureControl } from './__mocks__/reconfigureControl';
import * as set from './utils/set';
import { FormProvider } from './useFormContext';
import { renderHook } from '@testing-library/react-hooks';
import { useForm } from './useForm';

jest.spyOn(console, 'warn').mockImplementation(() => {});

const Input = ({ onChange, onBlur, placeholder }: any) => (
  <input
    placeholder={placeholder}
    onChange={() => onChange?.(1, 2)}
    onBlur={() => onBlur?.(1, 2)}
  />
);

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

  it('should be assigned method.control variable if wrap with FormProvider', () => {
    const { result } = renderHook(() => useForm());
    const control = reconfigureControl();
    const { asFragment } = render(
      <FormProvider {...{ ...result.current, ...control }}>
        <Controller defaultValue="" name="test" as={'input' as 'input'} />
      </FormProvider>,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should be included checked props when value is boolean', () => {
    const control = reconfigureControl();
    const fieldsRef = {
      current: {},
    };

    const { container } = render(
      <Controller
        defaultValue={false}
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

    expect(container.querySelector('input')!.checked).toBeFalsy();
  });

  it('should set defaultValue to value props when input was reset with SSR', () => {
    const control = reconfigureControl();
    const fieldsRef = {
      current: {},
    };
    const defaultValue = 'defaultValue';

    const { container, rerender } = render(
      <Controller
        defaultValue={defaultValue}
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

    // reset
    fieldsRef.current = {};

    rerender(
      <Controller
        defaultValue={defaultValue}
        name="test"
        as={<input />}
        control={
          {
            ...control,
            fieldsRef,
          } as any
        }
      />,
    );

    expect(container.querySelector('input')!.value).toBe(defaultValue);
  });

  it('should set defaultValuesRef variable to value props when input was reset with SSR', () => {
    const control = reconfigureControl();
    const fieldsRef = {
      current: {},
    };
    const defaultValue = 'defaultValue';
    const defaultValuesRef = {
      current: {
        test: '',
      },
    };

    const { container, rerender } = render(
      <Controller
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
            defaultValuesRef,
          } as any
        }
      />,
    );

    // reset
    fieldsRef.current = {};
    defaultValuesRef.current = {
      test: defaultValue,
    };

    rerender(
      <Controller
        name="test"
        as={<input />}
        control={
          {
            ...control,
            fieldsRef,
            defaultValuesRef,
          } as any
        }
      />,
    );

    expect(container.querySelector('input')!.value).toBe(defaultValue);
  });

  it('should render when registered field values are updated', () => {
    const control = reconfigureControl();
    const fieldsRef = {
      current: {},
    };
    let ref: Record<string, any> = {};

    const { container } = render(
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
              ref = payload;
            },
            fieldsRef,
          } as any
        }
      />,
    );

    const nextValue = 'test1';

    act(() => {
      ref.value = nextValue;
    });

    expect(container.querySelector('input')!.value).toBe(nextValue);
    expect(ref.value).toBe(nextValue);
  });

  it("should trigger component's onChange method and invoke setValue method", () => {
    const setValue = jest.fn();
    const control = reconfigureControl({
      setValue,
      mode: { isOnChange: false, isOnSubmit: true, isOnBlur: false },
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

    expect(setValue).toBeCalledWith('test', 'test', {
      shouldValidate: false,
    });
  });

  it("should trigger component's onBlur method and invoke setValue method", () => {
    const trigger = jest.fn();
    const control = reconfigureControl({
      trigger,
      mode: { isOnChange: false, isOnSubmit: true, isOnBlur: true },
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

    expect(trigger).toBeCalledWith('test');
  });

  it("should not invoke trigger method when call component's onBlur method if isOnBlur variable is false", () => {
    const trigger = jest.fn();
    const control = reconfigureControl({
      trigger,
      mode: { isOnChange: false, isOnSubmit: true, isOnBlur: false },
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

    expect(trigger).not.toBeCalled();
  });

  it("should trigger component's onBlur method and invoke set method and reRender method if touchedFieldsRef.current[name] is undefined", () => {
    const trigger = jest.fn();
    const reRender = jest.fn();
    const control = reconfigureControl({
      trigger,
      reRender,
      mode: { isOnChange: false, isOnSubmit: true, isOnBlur: true },
    });
    const fieldsRef = {
      current: {},
    };
    const readFormStateRef = {
      current: {
        touched: true,
      },
    };
    const touchedFieldsRef = {
      current: {},
    };
    const setMock = jest.spyOn(set, 'default');

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
            readFormStateRef,
            touchedFieldsRef,
          } as any
        }
      />,
    );

    fireEvent.blur(getByPlaceholderText('test'), {
      target: {
        value: 'test',
      },
    });

    expect(setMock).toBeCalledWith(touchedFieldsRef.current, 'test', true);
    expect(touchedFieldsRef.current).toEqual({ test: true });

    expect(reRender).toBeCalled();
    expect(trigger).toBeCalledWith('test');
  });

  it('should invoke custom event named method', () => {
    const setValue = jest.fn();
    const control = reconfigureControl({
      setValue,
      mode: { isOnChange: false, isOnSubmit: true, isOnBlur: true },
    });
    const fieldsRef = {
      current: {},
    };

    const { getByPlaceholderText } = render(
      <Controller
        defaultValue=""
        name="test"
        render={(props) => {
          return <input placeholder="test" {...props} />;
        }}
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

    expect(setValue).toBeCalledWith('test', 'test', {
      shouldValidate: false,
    });
  });

  it('should invoke custom onChange method', () => {
    const onChange = jest.fn();
    const setValue = jest.fn();
    const control = reconfigureControl({
      setValue,
      mode: { isOnChange: false, isOnSubmit: false, isOnBlur: true },
    });
    const fieldsRef = {
      current: {},
    };

    onChange.mockImplementation(() => 'test');

    const { getByPlaceholderText } = render(
      <Controller
        defaultValue=""
        name="test"
        render={({ onBlur, onChange, value }) => {
          return <Input placeholder="test" {...{ onChange, onBlur, value }} />;
        }}
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
  });

  it('should invoke custom onBlur method', () => {
    const onBlur = jest.fn();
    const control = reconfigureControl({
      mode: { isOnChange: false, isOnSubmit: false, isOnBlur: true },
    });
    const fieldsRef = {
      current: {},
    };

    const { getByPlaceholderText } = render(
      <Controller
        defaultValue=""
        name="test"
        render={({ onChange, value }) => {
          return <Input placeholder="test" {...{ onChange, onBlur, value }} />;
        }}
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

    expect(onBlur).toBeCalledWith(1, 2);
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
    const Input = ({ onChange, onBlur, selectedkey }: any) => (
      <input
        onChange={() => onChange?.(1, 2)}
        onBlur={() => onBlur?.(1, 2)}
        value={selectedkey}
      />
    );

    const { asFragment } = render(
      <Controller
        defaultValue="test"
        name="test"
        render={(props) => <Input {...props} selectedkey={props.value} />}
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

  it('should be null if as and render props are not given', () => {
    const { container } = render(
      <Controller defaultValue="" name="test" control={reconfigureControl()} />,
    );

    expect(container).toEqual(document.createElement('div'));
  });

  it('should update rules when rules gets updated', () => {
    const control = reconfigureControl();
    const fieldsRef = {
      current: {},
    };
    const defaultValue = '';

    const { rerender } = render(
      <Controller
        defaultValue={defaultValue}
        name="test"
        as={<input />}
        rules={{ required: true }}
        control={
          {
            ...control,
            register: (payload: any) => {
              // @ts-ignore
              fieldsRef.current[payload.name] = {
                required: true,
              };
            },
            fieldsRef,
          } as any
        }
      />,
    );

    rerender(
      <Controller
        defaultValue={defaultValue}
        name="test"
        as={<input />}
        rules={{ required: false }}
        control={{
          ...control,
          fieldsRef,
        }}
      />,
    );

    // @ts-ignore
    expect(fieldsRef.current.test.required).toBeFalsy();
  });

  it('should set initial state from unmount state', () => {
    const control = reconfigureControl();

    const { getByPlaceholderText } = render(
      <Controller
        defaultValue=""
        name="test"
        as={<input placeholder="test" />}
        control={
          {
            ...control,
            unmountFieldsStateRef: {
              current: {
                test: 'what',
              },
            },
            fieldsRef: {
              current: {
                test: {},
              },
            },
          } as any
        }
      />,
    );

    // @ts-ignore
    expect(getByPlaceholderText('test').value).toEqual('what');
  });

  it('should not set initial state from unmount state when input is part of field array', () => {
    const control = reconfigureControl();

    const { getByPlaceholderText } = render(
      <Controller
        defaultValue=""
        name="test[0]"
        as={<input placeholder="test" />}
        control={
          {
            ...control,
            unmountFieldsStateRef: {
              current: {
                test: 'what',
              },
            },
            fieldsRef: {
              current: {
                test: {},
              },
            },
            fieldArrayNamesRef: {
              current: new Set(['test']),
            },
          } as any
        }
      />,
    );

    // @ts-ignore
    expect(getByPlaceholderText('test').value).toEqual('');
  });
});
