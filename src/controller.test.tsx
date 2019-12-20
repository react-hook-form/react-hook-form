import * as React from 'react';
import { render } from '@testing-library/react';
import { Controller } from './index';

describe('React Hook Form Input', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <Controller
        name="test"
        as="input"
        control={{
          defaultValues: {},
          setValue: jest.fn(),
          register: jest.fn(),
          unregister: jest.fn(),
          errors: {},
          mode: { isOnSubmit: false, isOnBlur: false },
          reValidateMode: {
            isReValidateOnBlur: false,
            isReValidateOnSubmit: false,
          },
          formState: { isSubmitted: false },
        }}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
