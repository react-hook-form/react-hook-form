import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { useForm, useWatch } from '../index';

describe('issue: unexpected rerenders on submit with array name and exact', () => {
  it('should not re-render when submitting with array name + exact when parent has no formState access', async () => {
    // Exact reproduction of the issue scenario:
    // - Parent: useForm() with NO formState accessed
    // - Child: useWatch with name: ["firstName"], exact: true
    // - On submit: expect 0 re-renders in Child
    
    let childRenderCount = 0;

    const Child = ({ control }: any) => {
      useWatch({ control, name: ['firstName'], exact: true });
      childRenderCount++;
      return <p>watch</p>;
    };

    const Parent = () => {
      const { register, control, handleSubmit } = useForm<{ firstName: string }>();
      return (
        <form onSubmit={handleSubmit(() => {})}>
          <input {...register('firstName')} />
          <Child control={control} />
          <button type="submit">Submit</button>
        </form>
      );
    };

    render(<Parent />);

    // Type something - child should re-render
    fireEvent.input(screen.getAllByRole('textbox')[0], { target: { value: 'John' } });
    
    const countAfterTyping = childRenderCount;
    
    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }));

    // Wait for submit to complete (async)
    await waitFor(() => {});
    
    // The key assertion: NO extra re-renders on submit
    expect(childRenderCount).toBe(countAfterTyping);
  });
});
