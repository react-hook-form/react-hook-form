import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import { ErrorMessage } from '../errorMessage';
import { useForm } from '../useForm';
import { FormProvider } from '../useFormContext';

type SimpleForm = { name: string; nested: { field: string } };

type AnyProps = Record<string, unknown>;

function renderMessage(
  name: string,
  err: { type: string; message?: string; types?: Record<string, string> },
  props: AnyProps = {},
) {
  let setErr!: ReturnType<typeof useForm>['setError'];

  const Fixture = () => {
    const { control, setError } = useForm();
    setErr = setError;
    return (
      <ErrorMessage control={control} name={name as any} {...(props as any)} />
    );
  };

  const utils = render(<Fixture />);
  act(() => setErr(name as any, err));
  return utils;
}

describe('ErrorMessage', () => {
  describe('with control prop', () => {
    it('renders nothing when field has no error', () => {
      const App = () => {
        const { register, control } = useForm<SimpleForm>();
        return (
          <form>
            <input {...register('name')} />
            <ErrorMessage control={control} name="name" data-testid="msg" />
          </form>
        );
      };

      render(<App />);
      expect(screen.queryByTestId('msg')).not.toBeInTheDocument();
    });

    it('renders error message after submit with required rule', async () => {
      const App = () => {
        const { register, control, handleSubmit } = useForm<SimpleForm>();
        return (
          <form onSubmit={handleSubmit(() => {})}>
            <input {...register('name', { required: 'Name is required' })} />
            <ErrorMessage control={control} name="name" />
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<App />);
      fireEvent.click(screen.getByRole('button'));
      expect(await screen.findByText('Name is required')).toBeInTheDocument();
    });

    it('clears error message when field becomes valid', async () => {
      const App = () => {
        const { register, control, handleSubmit } = useForm<SimpleForm>();
        return (
          <form onSubmit={handleSubmit(() => {})}>
            <input
              {...register('name', { required: 'Name is required' })}
              placeholder="name"
            />
            <ErrorMessage control={control} name="name" />
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<App />);

      fireEvent.click(screen.getByRole('button'));
      expect(await screen.findByText('Name is required')).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText('name'), {
        target: { value: 'Alice' },
      });
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() =>
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument(),
      );
    });

    it('renders with `as` string element', async () => {
      const App = () => {
        const { register, control, handleSubmit } = useForm<SimpleForm>();
        return (
          <form onSubmit={handleSubmit(() => {})}>
            <input {...register('name', { required: 'Required' })} />
            <ErrorMessage control={control} name="name" as="p" />
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<App />);
      fireEvent.click(screen.getByRole('button'));
      const el = await screen.findByText('Required');
      expect(el.tagName).toBe('P');
    });

    it('renders with `as` React element (cloneElement path)', async () => {
      const App = () => {
        const { register, control, handleSubmit } = useForm<SimpleForm>();
        return (
          <form onSubmit={handleSubmit(() => {})}>
            <input {...register('name', { required: 'Required' })} />
            <ErrorMessage
              control={control}
              name="name"
              as={<span data-testid="errspan" />}
            />
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<App />);
      fireEvent.click(screen.getByRole('button'));
      const el = await screen.findByTestId('errspan');
      expect(el).toHaveTextContent('Required');
    });

    it('renders via render prop', async () => {
      const App = () => {
        const { register, control, handleSubmit } = useForm<SimpleForm>();
        return (
          <form onSubmit={handleSubmit(() => {})}>
            <input {...register('name', { required: 'Required' })} />
            <ErrorMessage
              control={control}
              name="name"
              render={({ message }) => (
                <span data-testid="custom">{message}</span>
              )}
            />
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<App />);
      fireEvent.click(screen.getByRole('button'));
      const el = await screen.findByTestId('custom');
      expect(el).toHaveTextContent('Required');
    });

    it('handles nested field names', async () => {
      const App = () => {
        const { register, control, handleSubmit } = useForm<SimpleForm>();
        return (
          <form onSubmit={handleSubmit(() => {})}>
            <input
              {...register('nested.field', { required: 'Nested required' })}
            />
            <ErrorMessage control={control} name="nested.field" />
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<App />);
      fireEvent.click(screen.getByRole('button'));
      expect(await screen.findByText('Nested required')).toBeInTheDocument();
    });

    it('does not re-render parent when only errors change', async () => {
      let parentRenders = 0;

      const ErrorDisplay = ({
        control,
      }: {
        control: ReturnType<typeof useForm<SimpleForm>>['control'];
      }) => <ErrorMessage control={control} name="name" />;

      const App = () => {
        const { register, control, handleSubmit } = useForm<SimpleForm>();
        parentRenders++;
        return (
          <form onSubmit={handleSubmit(() => {})}>
            <input {...register('name', { required: 'Required' })} />
            <ErrorDisplay control={control} />
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<App />);
      const rendersBefore = parentRenders;
      fireEvent.click(screen.getByRole('button'));
      await screen.findByText('Required');
      expect(parentRenders).toBe(rendersBefore);
    });
  });

  describe('with FormProvider context', () => {
    it('reads errors from context without control prop', async () => {
      const Child = () => <ErrorMessage name="name" />;

      const App = () => {
        const methods = useForm<SimpleForm>();
        return (
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(() => {})}>
              <input
                {...methods.register('name', { required: 'Context error' })}
              />
              <Child />
              <button type="submit">Submit</button>
            </form>
          </FormProvider>
        );
      };

      render(<App />);
      fireEvent.click(screen.getByRole('button'));
      expect(await screen.findByText('Context error')).toBeInTheDocument();
    });
  });

  describe('root errors', () => {
    it('renders root-level errors set via setError', async () => {
      const App = () => {
        const { control, setError } = useForm<SimpleForm>();
        return (
          <form>
            <ErrorMessage control={control} name="root" />
            <button
              type="button"
              onClick={() =>
                setError('root', { message: 'Something went wrong' })
              }
            >
              Trigger
            </button>
          </form>
        );
      };

      render(<App />);
      fireEvent.click(screen.getByRole('button'));
      expect(
        await screen.findByText('Something went wrong'),
      ).toBeInTheDocument();
    });
  });

  describe('snapshot: prop matrix', () => {
    it('should render correctly with no errors', () => {
      const Fixture = () => {
        const { control } = useForm();
        return <ErrorMessage control={control} name={'test' as any} />;
      };
      const { asFragment } = render(<Fixture />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with flat errors', () => {
      const { asFragment } = renderMessage('flat', {
        type: 'flat',
        message: 'flat',
      });
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with flat errors and as with string', () => {
      const { asFragment } = renderMessage(
        'flat',
        { type: 'flat', message: 'flat' },
        { as: 'span' },
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with flat errors and as with element and render', () => {
      const { asFragment } = renderMessage(
        'flat',
        { type: 'flat', message: 'flat' },
        { as: <span />, render: ({ message }: { message: string }) => message },
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with flat errors and as with component', () => {
      function CustErrComp({ children }: { children: React.ReactNode }) {
        return <div>{children}</div>;
      }
      const { asFragment } = renderMessage(
        'flat',
        { type: 'flat', message: 'flat' },
        { as: CustErrComp },
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with flat errors and as with component and render', () => {
      function CustErrComp({ children }: { children: React.ReactNode }) {
        return <div>{children}</div>;
      }
      const { asFragment } = renderMessage(
        'flat',
        { type: 'flat', message: 'flat' },
        {
          as: CustErrComp,
          render: ({ message }: { message: string }) => message,
        },
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with flat multiple errors and render', () => {
      const { asFragment } = renderMessage(
        'flat',
        {
          type: 'flat',
          message: 'flat',
          types: { flat1: 'flat1', flat2: 'flat2', flat3: 'flat3' },
        },
        {
          render: ({
            messages,
          }: {
            messages?: Record<string, string | boolean>;
          }) =>
            messages &&
            Object.entries(messages).map(([type, message]) => (
              <span key={type}>{message}</span>
            )),
        },
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with flat multiple errors and as with element and render', () => {
      const { asFragment } = renderMessage(
        'flat',
        {
          type: 'flat',
          message: 'flat',
          types: { flat1: 'flat1', flat2: 'flat2', flat3: 'flat3' },
        },
        {
          as: <div />,
          render: ({
            messages,
          }: {
            messages?: Record<string, string | boolean>;
          }) =>
            messages &&
            Object.entries(messages).map(([type, message]) => (
              <span key={type}>{message}</span>
            )),
        },
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with nested errors object', () => {
      const { asFragment } = renderMessage('nested.object', {
        type: 'object',
        message: 'object',
      });
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with nested errors object and as with string', () => {
      const { asFragment } = renderMessage(
        'nested.object',
        { type: 'object', message: 'object' },
        { as: 'span' },
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with nested errors and as with element and render', () => {
      const { asFragment } = renderMessage(
        'nested.object',
        { type: 'object', message: 'object' },
        { as: <span />, render: ({ message }: { message: string }) => message },
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with nested multiple errors and render', () => {
      const { asFragment } = renderMessage(
        'nested.object',
        {
          type: 'object',
          message: 'object',
          types: { object1: 'object1', object2: 'object2', object3: 'object3' },
        },
        {
          render: ({
            messages,
          }: {
            messages?: Record<string, string | boolean>;
          }) =>
            messages &&
            Object.entries(messages).map(([type, message]) => (
              <span key={type}>{message}</span>
            )),
        },
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with nested multiple errors and as with element and render', () => {
      const { asFragment } = renderMessage(
        'nested.object',
        {
          type: 'object',
          message: 'object',
          types: { object1: 'object1', object2: 'object2', object3: 'object3' },
        },
        {
          as: <div />,
          render: ({
            messages,
          }: {
            messages?: Record<string, string | boolean>;
          }) =>
            messages &&
            Object.entries(messages).map(([type, message]) => (
              <span key={type}>{message}</span>
            )),
        },
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with nested errors array', () => {
      const { asFragment } = renderMessage('nested.0.array', {
        type: 'array',
        message: 'array',
      });
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with nested errors array and as with string', () => {
      const { asFragment } = renderMessage(
        'nested.0.array',
        { type: 'array', message: 'array' },
        { as: 'span' },
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with nested errors array and as with element and render', () => {
      const { asFragment } = renderMessage(
        'nested.0.array',
        { type: 'array', message: 'array' },
        { as: <span />, render: ({ message }: { message: string }) => message },
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with nested multiple errors array and render', () => {
      const { asFragment } = renderMessage(
        'nested.0.array',
        {
          type: 'array',
          message: 'array',
          types: { array1: 'array1', array2: 'array2', array3: 'array3' },
        },
        {
          render: ({
            messages,
          }: {
            messages?: Record<string, string | boolean>;
          }) =>
            messages &&
            Object.entries(messages).map(([type, message]) => (
              <span key={type}>{message}</span>
            )),
        },
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly with nested multiple errors array and as with element and render', () => {
      const { asFragment } = renderMessage(
        'nested.0.array',
        {
          type: 'array',
          message: 'array',
          types: { array1: 'array1', array2: 'array2', array3: 'array3' },
        },
        {
          as: <div />,
          render: ({
            messages,
          }: {
            messages?: Record<string, string | boolean>;
          }) =>
            messages &&
            Object.entries(messages).map(([type, message]) => (
              <span key={type}>{message}</span>
            )),
        },
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('should render registered error message when message prop is also supplied', () => {
      const { asFragment } = renderMessage(
        'test',
        { type: 'test', message: 'test1' },
        { message: 'test2' },
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
