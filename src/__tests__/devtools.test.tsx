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
});
