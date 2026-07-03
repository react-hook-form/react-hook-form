import React from 'react';
import { useForm } from 'react-hook-form';

// Repro for: isSubmitting stuck `true` when the form's subtree is hidden by
// <Activity mode="hidden"> from inside the submit handler.
//
// Steps:
// 1. Click "Review" -> submit fires -> parent flips form to hidden.
// 2. Click "Back" -> form is shown again.
// 3. BUG: "Review" stays disabled because isSubmitting never reset to false
//    in the hidden (deferred) subtree.

function Review(props: { onBack: () => void }) {
  return (
    <div>
      <p>
        Reviewing… the form is now hidden via &lt;Activity mode="hidden"&gt;.
      </p>
      <button type="button" onClick={props.onBack}>
        Back
      </button>
    </div>
  );
}

function Form(props: { onSubmit: () => void }) {
  const form = useForm();
  return (
    <form onSubmit={form.handleSubmit(props.onSubmit)}>
      <input {...form.register('amount')} placeholder="amount" />
      <button type="submit" id="review" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Reviewing…' : 'Review'}
      </button>
      <p>
        isSubmitting:{' '}
        <span id="isSubmitting">{String(form.formState.isSubmitting)}</span>
      </p>
    </form>
  );
}

const ActivityIsSubmitting = () => {
  const [reviewing, setReviewing] = React.useState(false);
  return (
    <>
      <React.Activity mode={reviewing ? 'hidden' : 'visible'}>
        <Form onSubmit={() => setReviewing(true)} />
      </React.Activity>
      {reviewing && <Review onBack={() => setReviewing(false)} />}
    </>
  );
};

export default ActivityIsSubmitting;
