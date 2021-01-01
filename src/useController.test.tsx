import * as React from 'react';
import { useForm } from './useForm';
import { useController } from './useController';
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
      });

      return null;
    };

    render(<Component />);
  });
});
