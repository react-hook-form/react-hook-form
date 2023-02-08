import * as React from 'react';
import { render } from '@testing-library/react';

import { Form } from '../form';
import { useForm } from '../useForm';
import { FormProvider } from '../useFormContext';

describe('Form', () => {
  it('should support render with both form tag and headless', () => {
    const WithContext = () => {
      return (
        <>
          <Form />
          <Form
            render={() => {
              return null;
            }}
          />
        </>
      );
    };

    const App = () => {
      const methods = useForm();
      return (
        <div>
          <Form control={methods.control}>
            <input />
          </Form>
          <Form
            control={methods.control}
            render={() => {
              return null;
            }}
          />

          <FormProvider {...methods}>
            <WithContext />
          </FormProvider>
        </div>
      );
    };

    render(<App />);
  });
});
