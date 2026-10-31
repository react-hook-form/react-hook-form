import React from 'react';
import { render, screen } from '@testing-library/react';

// Simulate React Native, where `window` exists but `document` does not, so isWeb is false
jest.mock('../utils/isWeb', () => ({ __esModule: true, default: false }));

import { useForm } from '../useForm';
import { useWatch } from '../useWatch';

describe('useWatch with non-web effects (#13966)', () => {
  it('picks up a reset() made in an earlier mount effect', async () => {
    const App = () => {
      const { control, reset } = useForm({
        defaultValues: { name: 'default' },
      });
      React.useEffect(() => {
        reset({ name: 'from reset' });
      }, [reset]);
      const name = useWatch({ control, name: 'name' });
      return <p>{name}</p>;
    };
    render(<App />);
    expect(await screen.findByText('from reset')).toBeVisible();
  });

  it('picks up a setValue() made in an earlier mount effect', async () => {
    const App = () => {
      const { control, setValue } = useForm({
        defaultValues: { name: 'default' },
      });
      React.useEffect(() => {
        setValue('name', 'from setValue');
      }, [setValue]);
      const name = useWatch({ control, name: 'name' });
      return <p>{name}</p>;
    };
    render(<App />);
    expect(await screen.findByText('from setValue')).toBeVisible();
  });

  it('whole-form watch also catches up', async () => {
    const App = () => {
      const { control, reset } = useForm({
        defaultValues: { name: 'default' },
      });
      React.useEffect(() => {
        reset({ name: 'from reset' });
      }, [reset]);
      const values = useWatch({ control });
      return <p>{values.name}</p>;
    };
    render(<App />);
    expect(await screen.findByText('from reset')).toBeVisible();
  });
});
