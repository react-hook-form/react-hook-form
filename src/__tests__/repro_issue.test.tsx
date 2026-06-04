import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm } from '../useForm';
import { useWatch } from '../useWatch';
import type { Control } from '../types';

describe('issue: unexpected rerenders on submit with array name', () => {
  // The key difference: array name vs string name
  // For array name, generateWatchOutput returns a new array reference on each call
  // If updateValue is called with the same array contents but different reference, React re-renders
  
  it('array name - should not extra re-render when parent re-renders on submit', async () => {
    let childRenderCount = 0;

    function WatchedComponent({ control }: { control: Control<{ firstName: string }> }) {
      // Array name - this creates a new array ref on each render in the hook call
      useWatch({ control, name: ['firstName'] as const, exact: true });
      childRenderCount++;
      return <p>Watch</p>;
    }

    function App() {
      // Access errors so parent re-renders on submit
      const { register, control, handleSubmit, formState: { errors } } = useForm<{ firstName: string }>();
      return (
        <form onSubmit={handleSubmit(() => {})}>
          <input {...register('firstName')} data-testid="input" />
          <WatchedComponent control={control} />
          <p>{errors?.firstName?.message || ''}</p>
          <button type="submit">Submit</button>
        </form>
      );
    }

    render(<App />);
    childRenderCount = 0;

    // Type a value so subscription has fired and value is "John"
    fireEvent.input(screen.getByTestId('input'), { target: { value: 'John' } });
    expect(childRenderCount).toBe(1); // 1 normal re-render from value change
    childRenderCount = 0;

    // Submit: parent re-renders once due to errors state change
    // Child should only follow parent ONCE - not get an extra render from useWatch
    fireEvent.submit(screen.getByRole('button'));

    await waitFor(() => expect(childRenderCount).toBeGreaterThan(0));

    // Should be exactly 1 re-render (from parent cascade only)
    // NOT 2 (which would mean useWatch also triggered updateValue with same-valued array)
    expect(childRenderCount).toBe(1);
  });

  it('string name - should not extra re-render (baseline comparison)', async () => {
    let childRenderCount = 0;

    function WatchedComponent({ control }: { control: Control<{ firstName: string }> }) {
      // String name - generateWatchOutput returns a primitive string
      useWatch({ control, name: 'firstName' });
      childRenderCount++;
      return <p>Watch</p>;
    }

    function App() {
      const { register, control, handleSubmit, formState: { errors } } = useForm<{ firstName: string }>();
      return (
        <form onSubmit={handleSubmit(() => {})}>
          <input {...register('firstName')} data-testid="input" />
          <WatchedComponent control={control} />
          <p>{errors?.firstName?.message || ''}</p>
          <button type="submit">Submit</button>
        </form>
      );
    }

    render(<App />);
    childRenderCount = 0;

    fireEvent.input(screen.getByTestId('input'), { target: { value: 'John' } });
    expect(childRenderCount).toBe(1);
    childRenderCount = 0;

    fireEvent.submit(screen.getByRole('button'));

    await waitFor(() => expect(childRenderCount).toBeGreaterThan(0));

    // String names use Object.is comparison in React - same value = no extra render
    expect(childRenderCount).toBe(1);
  });
});
