import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useForm } from '../../useForm';

/**
 * Attempt to reproduce #13563 in Jest/jsdom: formState.isSubmitting stays
 * stuck `true` when the form's subtree is hidden by <Activity mode="hidden">
 * from inside the submit handler.
 *
 * NOTE: jsdom CANNOT reproduce this bug — this test passes even against a
 * build where the bug is present (plain Playwright against a real browser
 * reproduces it 100% of the time). React Testing Library wraps events in
 * `act`, which flushes React's deferred offscreen <Activity> work before
 * assertions run, so the stuck state is never observable here.
 *
 * Kept as a normal-path regression guard. The faithful, deterministic repro
 * lives in Vitest browser mode:
 * src/__tests__/useForm/isSubmittingActivity.browser.test.tsx
 */
describe('isSubmitting with <Activity>', () => {
  it('resets after the form is hidden by <Activity> mid-submit', async () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'Review' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Back' })).toBeVisible(),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Review' })).toBeEnabled(),
    );
  });
});
