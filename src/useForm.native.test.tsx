import * as React from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { render, fireEvent, wait } from '@testing-library/react-native';
import { useForm } from './useForm';
import * as focusOnErrorField from './logic/focusOnErrorField';

describe('useForm with React Native', () => {
  beforeEach(() => {
    // @ts-ignore
    global.window = global;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should register field', () => {
    let control: any;
    const Component = () => {
      const { register, control: tempControl } = useForm();
      control = tempControl;
      return (
        <View>
          <TextInput
            ref={() => register({ name: 'test' }, { required: 'required' })}
          />
        </View>
      );
    };

    render(<Component />);

    expect(control.fieldsRef.current).toEqual({
      test: {
        ref: {
          name: 'test',
        },
        required: 'required',
      },
    });
  });

  it('should not invoke focus', async () => {
    const mockFocus = jest.spyOn(focusOnErrorField, 'default');
    const callback = jest.fn();

    const Component = () => {
      const { register, handleSubmit, errors } = useForm();
      return (
        <View>
          <TextInput
            ref={() => register({ name: 'test' }, { required: true })}
          />
          <Button title={'button'} onPress={handleSubmit(callback)} />
          <Text>{errors.test && 'required'}</Text>
        </View>
      );
    };

    const { getByText } = render(<Component />);

    fireEvent.press(getByText('button'));

    await wait(() => expect(mockFocus).not.toHaveBeenCalled());
    expect(callback).not.toHaveBeenCalled();
    expect(getByText('required').props.children).toBe('required');
  });
});
