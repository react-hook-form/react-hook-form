import * as React from 'react';
import { render } from '@testing-library/react';
import { ErrorMessage } from './index';

describe('React Hook Form Error Message', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<ErrorMessage name="test" />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with flat errors', () => {
    const { asFragment } = render(
      <ErrorMessage
        errors={{ flat: { type: 'flat', message: 'flat' } }}
        name="flat"
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with flat errors and as with string', () => {
    const { asFragment } = render(
      <ErrorMessage
        as="span"
        errors={{
          nested: {
            object: { type: 'object', message: 'object' },
          },
        }}
        name="nested.object"
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with nested errors object', () => {
    const { asFragment } = render(
      <ErrorMessage
        errors={{
          nested: {
            object: { type: 'object', message: 'object' },
          },
        }}
        name="nested.object"
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with nested errors object and as with component', () => {
    const { asFragment } = render(
      <ErrorMessage
        as={<span />}
        errors={{
          nested: {
            object: { type: 'object', message: 'object' },
          },
        }}
        name="nested.object"
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with nested errors array', () => {
    const { asFragment } = render(
      <ErrorMessage
        errors={{
          nested: [
            {
              array: { type: 'array', message: 'array' },
            },
          ],
        }}
        name="nested[0].array"
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with nested errors array and as with component', () => {
    const { asFragment } = render(
      <ErrorMessage
        as={<span />}
        errors={{
          nested: [
            {
              array: { type: 'array', message: 'array' },
            },
          ],
        }}
        name="nested[0].array"
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
