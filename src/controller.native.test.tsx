import * as React from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { useForm } from './useForm';
import { Controller } from './controller';
import { render, fireEvent, wait } from '@testing-library/react-native';
import * as focusOnErrorField from './logic/focusOnErrorField';

describe('Controller with React Native', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not occur error when invoked reset', async () => {
    const mockFocus = jest.spyOn(focusOnErrorField, 'default');
    const callback = jest.fn();

    const Component = () => {
      const { handleSubmit, errors, reset, control } = useForm();
      return (
        <View>
          <Controller
            name="test"
            rules={{ minLength: 5 }}
            control={control}
            render={({ onChange, onBlur, value }) => (
              <TextInput
                testID={'input'}
                onChange={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
          <Text>{errors.test && 'required'}</Text>
          <Button title={'submit'} onPress={handleSubmit(callback)} />
          <Button title={'reset'} onPress={() => reset()} />
        </View>
      );
    };

    const { getByText, getByTestId, queryByText } = render(<Component />);

    const input = getByTestId('input');

    fireEvent.change(input, 'test');

    fireEvent.press(getByText('submit'));

    await wait(() => expect(mockFocus).toHaveBeenCalled());

    expect(callback).not.toHaveBeenCalled();
    expect(input.props.value).toBe('test');
    expect(getByText('required').props.children).toBe('required');

    fireEvent.press(getByText('reset'));

    expect(input.props.value).toBe('test');
    expect(queryByText('required')).toBeNull();
  });
});
