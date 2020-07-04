import * as React from 'react';
import { View, TextInput, Button } from 'react-native';
import { render, fireEvent, wait } from '@testing-library/react-native';
import { useForm } from './useForm';
import * as focusOnErrorField from './logic/focusOnErrorField';

describe('useForm with React Native', () => {
  it('should not focus', async () => {
    const mockFocus = jest.spyOn(focusOnErrorField, 'default');
    const callback = jest.fn();

    const Component = () => {
      const { register, handleSubmit } = useForm();
      return (
        <View>
          <TextInput
            ref={() => register({ name: 'test' }, { required: true })}
          />
          <Button title={'button'} onPress={handleSubmit(callback)} />
        </View>
      );
    };

    const { getByText } = render(<Component />);

    fireEvent.press(getByText('button'));

    await wait(() => expect(mockFocus).not.toHaveBeenCalled());
    expect(callback).toHaveBeenCalled();
  });
});
