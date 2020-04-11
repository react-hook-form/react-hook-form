import React from 'react';
import { render } from '@testing-library/react';
import { ErrorMessage } from './index';

jest.spyOn(console, 'warn').mockImplementation(() => ({}));

describe('React Hook Form Error Message', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<ErrorMessage name="test" errors={{}} />);

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
        as={'span' as 'span'}
        errors={{ flat: { type: 'flat', message: 'flat' } }}
        name="flat"
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with flat errors and as with string and className', () => {
    const { asFragment } = render(
      <ErrorMessage
        as={'span' as 'span'}
        errors={{ flat: { type: 'flat', message: 'flat' } }}
        name="flat"
        className="test"
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with flat errors and as with component and children', () => {
    const { asFragment } = render(
      <ErrorMessage
        as={<span />}
        errors={{ flat: { type: 'flat', message: 'flat' } }}
        name="flat"
      >
        {({ message }) => message}
      </ErrorMessage>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with flat errors and as with component and className and children', () => {
    const { asFragment } = render(
      <ErrorMessage
        as={<span />}
        errors={{ flat: { type: 'flat', message: 'flat' } }}
        name="flat"
        className="test"
      >
        {({ message }) => message}
      </ErrorMessage>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with flat multiple errors and children', () => {
    const { asFragment } = render(
      <ErrorMessage
        errors={{
          flat: {
            type: 'flat',
            message: 'flat',
            types: {
              flat1: 'flat1',
              flat2: 'flat2',
              flat3: 'flat3',
            },
          },
        }}
        name="flat"
      >
        {({ messages }) =>
          messages &&
          Object.entries(messages).map(([type, message]) => (
            <span key={type}>{message}</span>
          ))
        }
      </ErrorMessage>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with flat multiple errors and as with component and children', () => {
    const { asFragment } = render(
      <ErrorMessage
        as={<div />}
        errors={{
          flat: {
            type: 'flat',
            message: 'flat',
            types: {
              flat1: 'flat1',
              flat2: 'flat2',
              flat3: 'flat3',
            },
          },
        }}
        name="flat"
      >
        {({ messages }) =>
          messages &&
          Object.entries(messages).map(([type, message]) => (
            <span key={type}>{message}</span>
          ))
        }
      </ErrorMessage>,
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

  it('should render correctly with nested errors object and as with string', () => {
    const { asFragment } = render(
      <ErrorMessage
        as={'span' as 'span'}
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

  it('should render correctly with nested errors and as with componet and children', () => {
    const { asFragment } = render(
      <ErrorMessage
        as={<span />}
        errors={{
          nested: {
            object: { type: 'object', message: 'object' },
          },
        }}
        name="nested.object"
      >
        {({ message }) => message}
      </ErrorMessage>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with nested multiple errors and children', () => {
    const { asFragment } = render(
      <ErrorMessage
        errors={{
          nested: {
            object: {
              type: 'object',
              message: 'object',
              types: {
                object1: 'object1',
                object2: 'object2',
                object3: 'object3',
              },
            },
          },
        }}
        name="nested.object"
      >
        {({ messages }) =>
          messages &&
          Object.entries(messages).map(([type, message]) => (
            <span key={type}>{message}</span>
          ))
        }
      </ErrorMessage>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with nested multiple errors and as with component and children', () => {
    const { asFragment } = render(
      <ErrorMessage
        as={<div />}
        errors={{
          nested: {
            object: {
              type: 'object',
              message: 'object',
              types: {
                object1: 'object1',
                object2: 'object2',
                object3: 'object3',
              },
            },
          },
        }}
        name="nested.object"
      >
        {({ messages }) =>
          messages &&
          Object.entries(messages).map(([type, message]) => (
            <span key={type}>{message}</span>
          ))
        }
      </ErrorMessage>,
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

  it('should render correctly with nested errors array and as with string', () => {
    const { asFragment } = render(
      <ErrorMessage
        as={'span' as 'span'}
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

  it('should render correctly with nested errors array and as with component and children', () => {
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
      >
        {({ message }) => message}
      </ErrorMessage>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with nested multiple errors array and children', () => {
    const { asFragment } = render(
      <ErrorMessage
        errors={{
          nested: [
            {
              array: {
                type: 'array',
                message: 'array',
                types: {
                  array1: 'array1',
                  array2: 'array2',
                  array3: 'array3',
                },
              },
            },
          ],
        }}
        name="nested[0].array"
      >
        {({ messages }) =>
          messages &&
          Object.entries(messages).map(([type, message]) => (
            <span key={type}>{message}</span>
          ))
        }
      </ErrorMessage>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with nested multiple errors array and as with component and children', () => {
    const { asFragment } = render(
      <ErrorMessage
        as={<div />}
        errors={{
          nested: [
            {
              array: {
                type: 'array',
                message: 'array',
                types: {
                  array1: 'array1',
                  array2: 'array2',
                  array3: 'array3',
                },
              },
            },
          ],
        }}
        name="nested[0].array"
      >
        {({ messages }) =>
          messages &&
          Object.entries(messages).map(([type, message]) => (
            <span key={type}>{message}</span>
          ))
        }
      </ErrorMessage>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render errors message when errors message is supplied', () => {
    const { asFragment } = render(
      <ErrorMessage
        errors={{ test: { type: 'test', message: 'test1' } }}
        name="test"
        message="test2"
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with message that is string', () => {
    const { asFragment } = render(
      <ErrorMessage
        errors={{ test: { type: 'test' } }}
        name="test"
        message="test"
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with message that is ReactElement', () => {
    const { asFragment } = render(
      <ErrorMessage
        errors={{ test: { type: 'test' } }}
        name="test"
        message={<p>test</p>}
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with errors message that is ReactElement', () => {
    const { asFragment } = render(
      <ErrorMessage
        errors={{ test: { type: 'test', message: <p>test</p> } }}
        name="test"
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
