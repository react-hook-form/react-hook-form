import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it } from 'vitest';

import { FormStateSubscribe } from '../formStateSubscribe';
import { useForm } from '../useForm';

describe('FormStateSubscribe with SSR', () => {
  it('should render correctly', () => {
    const Component = () => {
      const { control } = useForm<{
        test: string;
      }>();

      return (
        <FormStateSubscribe
          control={control}
          name="test"
          render={(state) => <span>{state.errors.test?.message}</span>}
        />
      );
    };

    renderToString(<Component />);
  });
});
