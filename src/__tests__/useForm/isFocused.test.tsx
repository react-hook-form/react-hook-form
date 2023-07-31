import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { useForm } from '../../useForm';

describe('isFocused', () => {
  it('should return true when field has focus', () => {
    const Component = () => {
      const { register, isFocused } = useForm<{
        test: string;
      }>();
      const [hasFocus, setHasFocus] = React.useState(false);

      return (
        <>
          <input {...register('test')} placeholder="test" />
          <button onClick={() => setHasFocus(isFocused('test'))}>
            check focus
          </button>
          <span data-testid="result">{hasFocus ? 'focused' : 'not focused'}</span>
        </>
      );
    };

    render(<Component />);

    const input = screen.getByPlaceholderText('test');
    const button = screen.getByRole('button');

    // Initially not focused
    fireEvent.click(button);
    expect(screen.getByTestId('result')).toHaveTextContent('not focused');

    // Focus the input and check
    fireEvent.focus(input);
    fireEvent.click(button);
    expect(screen.getByTestId('result')).toHaveTextContent('focused');

    // Blur the input and check again
    fireEvent.blur(input);
    fireEvent.click(button);
    expect(screen.getByTestId('result')).toHaveTextContent('not focused');
  });

  it('should return false for unregistered field', () => {
    const Component = () => {
      const { register, isFocused } = useForm<{
        test: string;
        other: string;
      }>();
      const [hasFocus, setHasFocus] = React.useState(false);

      return (
        <>
          <input {...register('test')} placeholder="test" />
          <button onClick={() => setHasFocus(isFocused('other'))}>
            check focus
          </button>
          <span data-testid="result">{hasFocus ? 'focused' : 'not focused'}</span>
        </>
      );
    };

    render(<Component />);

    const input = screen.getByPlaceholderText('test');
    fireEvent.focus(input);
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByTestId('result')).toHaveTextContent('not focused');
  });

  it('should work with radio button groups', () => {
    const Component = () => {
      const { register, isFocused } = useForm<{
        radio: string;
      }>();
      const [hasFocus, setHasFocus] = React.useState(false);

      return (
        <>
          <input {...register('radio')} type="radio" value="a" data-testid="radio-a" />
          <input {...register('radio')} type="radio" value="b" data-testid="radio-b" />
          <button onClick={() => setHasFocus(isFocused('radio'))}>
            check focus
          </button>
          <span data-testid="result">{hasFocus ? 'focused' : 'not focused'}</span>
        </>
      );
    };

    render(<Component />);

    const radioA = screen.getByTestId('radio-a');
    const button = screen.getByRole('button');

    // Focus first radio button
    fireEvent.focus(radioA);
    fireEvent.click(button);
    expect(screen.getByTestId('result')).toHaveTextContent('focused');
  });

  it('should work with nested field names', () => {
    const Component = () => {
      const { register, isFocused } = useForm<{
        user: { name: string };
      }>();
      const [hasFocus, setHasFocus] = React.useState(false);

      return (
        <>
          <input {...register('user.name')} placeholder="name" />
          <button onClick={() => setHasFocus(isFocused('user.name'))}>
            check focus
          </button>
          <span data-testid="result">{hasFocus ? 'focused' : 'not focused'}</span>
        </>
      );
    };

    render(<Component />);

    const input = screen.getByPlaceholderText('name');
    const button = screen.getByRole('button');

    fireEvent.focus(input);
    fireEvent.click(button);
    expect(screen.getByTestId('result')).toHaveTextContent('focused');
  });
});
