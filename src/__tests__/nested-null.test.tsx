import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useForm } from '../useForm';

function TestComponent() {
  const { register, handleSubmit } = useForm<{
    example: { inner?: string } | null;
  }>({
    defaultValues: {
      example: null,
    },
  });
  const onSubmit = (data: any) => {
    (window as any).submittedData = data;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('example.inner')} />
      <button type="submit">Submit</button>
    </form>
  );
}

describe('nested null bug', () => {
  it('should not keep parent as null and allow nested value', async () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      const result = (window as any).submittedData;

      expect(result).toEqual({
        example: { inner: '' },
      });
    });
  });
});
