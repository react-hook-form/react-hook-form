import * as React from 'react';
import { useForm } from './useForm';
import { useController } from './useController';
import { render } from '@testing-library/react';

describe.skip('useController', () => {
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
});
