import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { DevTool } from '../devtools';
import { useForm } from '../useForm';
import { FormProvider } from '../useFormContext';

const App = ({ withProvider }: { withProvider?: boolean }) => {
  const methods = useForm({
    defaultValues: { firstName: 'bill', lastName: '' },
  });

  return withProvider ? (
    <FormProvider {...methods}>
      <input {...methods.register('firstName')} />
      <DevTool />
    </FormProvider>
  ) : (
    <form>
      <input {...methods.register('firstName')} />
      <input {...methods.register('lastName', { required: 'Required' })} />
      <button onClick={methods.handleSubmit(() => {})}>submit</button>
      <DevTool control={methods.control} />
    </form>
  );
};

const open = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Show dev panel' }));

describe('DevTool', () => {
  beforeEach(() => localStorage.clear());

  it('should move focus between the toggle buttons', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Show dev panel' }));

    const closeButton = screen.getByRole('button', { name: 'Close dev panel' });
    await waitFor(() => expect(document.activeElement).toBe(closeButton));

    fireEvent.click(closeButton);

    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Show dev panel' }),
      ),
    );
  });

  it('should render registered fields with values and errors', async () => {
    render(<App />);
    open();

    expect(await screen.findByText('firstName')).toBeVisible();
    expect(screen.getByText('"bill"')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    expect(await screen.findByText('Required')).toBeVisible();
    expect(screen.getByText('required')).toBeVisible();
  });

  it('should filter fields by name', async () => {
    render(<App />);
    open();

    await screen.findByText('lastName');

    fireEvent.change(screen.getByRole('searchbox', { name: 'Filter fields' }), {
      target: { value: 'first' },
    });

    expect(screen.getByText('firstName')).toBeVisible();
    expect(screen.queryByText('lastName')).not.toBeInTheDocument();
  });

  it('should read control from form context', async () => {
    render(<App withProvider />);
    open();

    expect(await screen.findByText('firstName')).toBeVisible();
  });

  it('should persist the open state', () => {
    const { unmount } = render(<App />);

    open();
    unmount();
    render(<App />);

    expect(
      screen.getByRole('button', { name: 'Close dev panel' }),
    ).toBeVisible();
  });

  it('should list fields registered and unregistered after mount', async () => {
    const Conditional = ({ control, register }: any) => {
      const [show, setShow] = React.useState(false);

      return (
        <>
          <button type="button" onClick={() => setShow(!show)}>
            toggle
          </button>
          {show && <input {...register('conditional')} />}
          <DevTool control={control} />
        </>
      );
    };

    const Form = () => {
      const { control, register } = useForm({ shouldUnregister: true });

      return (
        <>
          <DevTool control={control} placement="top-left" />
          <Conditional control={control} register={register} />
        </>
      );
    };

    render(<Form />);

    fireEvent.click(
      screen.getAllByRole('button', { name: 'Show dev panel' })[0],
    );
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));

    await waitFor(() =>
      expect(screen.getAllByText('conditional')).toHaveLength(2),
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));

    await waitFor(() =>
      expect(screen.queryByText('conditional')).not.toBeInTheDocument(),
    );
  });

  it('should throw a helpful error without control or provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<DevTool />)).toThrow(
      'DevTool requires a `control` prop or to be rendered inside <FormProvider>.',
    );
  });

  it('should scope persisted settings by id', () => {
    const Form = ({ id }: { id: string }) => {
      const { control } = useForm();
      return <DevTool id={id} control={control} />;
    };

    const { unmount } = render(<Form id="a" />);
    open();
    unmount();

    render(<Form id="b" />);

    expect(
      screen.getByRole('button', { name: 'Show dev panel' }),
    ).toBeVisible();
  });

  it('should reset drag state on pointer cancel', () => {
    render(<App />);

    const toggle = screen.getByRole('button', { name: 'Show dev panel' });

    fireEvent.pointerDown(toggle, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(toggle, { clientX: 60, clientY: 60 });
    fireEvent.pointerCancel(toggle);
    fireEvent.click(toggle);

    expect(
      screen.getByRole('button', { name: 'Close dev panel' }),
    ).toBeVisible();
  });

  describe('extension bridge', () => {
    const messages: any[] = [];
    const listener = (event: MessageEvent) => messages.push(event.data);

    beforeEach(() => {
      messages.length = 0;
      window.addEventListener('message', listener);
    });

    afterEach(() => window.removeEventListener('message', listener));

    const Form = () => {
      const { control, register } = useForm({
        defaultValues: { count: 0, agree: false },
      });

      return (
        <>
          <input {...register('count')} />
          <input type="checkbox" {...register('agree')} />
          <DevTool id="form" control={control} />
        </>
      );
    };

    it('should ignore INIT messages from another origin', async () => {
      render(<Form />);

      fireEvent(
        window,
        new MessageEvent('message', {
          data: { source: 'react-hook-form-bridge', type: 'INIT' },
          origin: 'https://evil.example',
          source: window,
        }),
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(messages).toEqual([
        { source: 'react-hook-form-bridge', type: 'INIT' },
      ]);
    });

    it('should send falsy values and keep the panel visible', async () => {
      render(<Form />);

      fireEvent(
        window,
        new MessageEvent('message', {
          data: { source: 'react-hook-form-bridge', type: 'INIT' },
          origin: window.location.origin,
          source: window,
        }),
      );

      await waitFor(() =>
        expect(messages.map((message) => message.type)).toContain('UPDATE'),
      );

      expect(
        messages.find((message) => message.type === 'UPDATE').payload.data
          .formValues,
      ).toEqual({ count: 0, agree: false });
      expect(
        screen.getByRole('button', { name: 'Show dev panel' }),
      ).toBeVisible();
    });
  });
});
