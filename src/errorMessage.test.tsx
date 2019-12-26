import * as React from 'react';
import { render } from '@testing-library/react';
import { ErrorMessage } from './index';

describe('React Hook Form Error Message', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <ErrorMessage
        errors={{ test: { type: 'test', message: 'test' } }}
        as={<span />}
        name="test"
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
