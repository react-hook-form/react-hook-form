import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { useForm } from '../../useForm';

// Real-browser reproduction. Runs under Vitest browser mode (Playwright chromium)
// because jsdom flushes the offscreen <Activity> subtree and hides the bug.
it('resets isSubmitting after the form is hidden by <Activity> mid-submit', async () => {
  function Review(props: { onBack: () => void }) {
    return (
      <button type="button" onClick={props.onBack}>
        Back
      </button>
    );
  }

  function Form(props: { onSubmit: () => void }) {
    const form = useForm();
    return (
      <form onSubmit={form.handleSubmit(props.onSubmit)}>
        <input {...form.register('amount')} />
        <button type="submit" disabled={form.formState.isSubmitting}>
          Review
        </button>
      </form>
    );
  }

  function App() {
    const [reviewing, setReviewing] = React.useState(false);
    return (
      <>
        <React.Activity mode={reviewing ? 'hidden' : 'visible'}>
          <Form onSubmit={() => setReviewing(true)} />
        </React.Activity>
        {reviewing && <Review onBack={() => setReviewing(false)} />}
      </>
    );
  }

  render(<App />);

  await userEvent.click(screen.getByRole('button', { name: 'Review' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy(),
  );

  await userEvent.click(screen.getByRole('button', { name: 'Back' }));

  expect(screen.getByRole('button', { name: 'Review' })).toBeEnabled();
});
