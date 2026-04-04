import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useForm } from '../useForm';

function TestComponent({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { register, handleSubmit } = useForm<{
    example: { inner?: string } | null;
  }>({
    defaultValues: {
      example: null,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('example.inner')} />
      <button type="submit">Submit</button>
    </form>
  );
}

describe('nested null bug', () => {
  it('should not keep parent as null and allow nested value', async () => {
    const onSubmit = jest.fn();
    render(<TestComponent onSubmit={onSubmit} />);

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { example: { inner: '' } },
        expect.anything(),
      );
    });
  });
});
