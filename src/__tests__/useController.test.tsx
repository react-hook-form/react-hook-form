import * as React from 'react';
import { useForm } from '../useForm';
import { useController } from '../useController';
import { render } from '@testing-library/react';

describe('useController', () => {
  it('should render input correctly', () => {
    const Component = () => {
      const { control } = useForm<{
        test: string;
        test1: { test: string }[];
      }>();

      useController({
        name: 'test',
        control,
        defaultValue: '',
      });

      return null;
    };

    render(<Component />);
  });

  it('should work for checkbox component natively', () => {
    const Component = () => {
      const { control } = useForm<{
        test: string;
      }>();

      const { field } = useController({
        name: 'test',
        control,
        defaultValue: '',
      });

      return (
        <input
          type="checkbox"
          onChange={(e) => {
            field.onChange(e.target.checked);
          }}
          value={field.value}
        />
      );
    };

    render(<Component />);
  });
});
