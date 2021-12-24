import React from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import * as focusOnErrorField from './logic/focusFieldBy';
import { Controller } from './controller';
import { useForm } from './useForm';

describe('Controller with React Native', () => {
  jest.setTimeout(20000);

  it('should not occur error when invoked reset', async () => {
    const mockFocus = jest.spyOn(focusOnErrorField, 'default');
    const callback = jest.fn();

    const Component = () => {
      const {
        handleSubmit,
        formState: { errors },
        reset,
        control,
      } = useForm<{
        test: string;
      }>();

      return (
        <View>
          <Controller
            name="test"
            rules={{ minLength: 5 }}
            control={control}
            defaultValue=""
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                testID={'input'}
                onChangeText={onChange}
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

    fireEvent.changeText(input, 'test');

    fireEvent.press(getByText('submit'));

    await waitFor(() => expect(mockFocus).toHaveBeenCalled());

    expect(callback).not.toHaveBeenCalled();
    expect(input.props.value).toBe('test');
    expect(getByText('required').props.children).toBe('required');

    fireEvent.press(getByText('reset'));

    expect(input.props.value).toBeUndefined();
    expect(queryByText('required')).toEqual('');
  });
});
