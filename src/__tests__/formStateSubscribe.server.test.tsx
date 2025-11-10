import React from 'react';
import { renderToString } from 'react-dom/server';

import { FormStateSubscribe } from '../formStateSubscribe';
import { useForm } from '../useForm';

describe('FormState with SSR', () => {
  // issue: https://github.com/react-hook-form/react-hook-form/issues/1398
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
