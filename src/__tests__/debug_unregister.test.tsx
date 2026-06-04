import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import type { Control } from '../types';
import { useForm, useWatch } from '../index';

(window as any).__DEBUG_USEWATCH = true;

test('debug unregister - trace refreshValue', () => {
  const Test = ({ control }: { control: Control<{test: string}> }) => {
    const value = useWatch({ control, name: 'test' });
    return <div>{value === undefined ? 'yes' : 'no'}</div>;
  };

  const Component = () => {
    const { register, control, unregister } = useForm<{test: string}>({
      defaultValues: { test: 'test' },
    });

    React.useEffect(() => {
      register('test');
    }, [register]);

    return (
      <>
        <Test control={control} />
        <button onClick={() => unregister('test')}>unregister</button>
      </>
    );
  };

  render(<Component />);
  console.log('--- clicking unregister ---');
  fireEvent.click(screen.getByRole('button'));
  console.log('--- after click ---');
  
  expect(screen.getByText('yes')).toBeVisible();
});
