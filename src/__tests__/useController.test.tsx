import * as React from 'react';
import { useForm } from '../useForm';
import { useController } from '../useController';
import { render, screen, fireEvent, act } from '@testing-library/react';

describe('useController', () => {
  it('should render input correctly', () => {
    const Component = () => {
      const { control } = useForm<{
        test: string;
        test1: { test: string }[];
      }>();

      useController({
        name: 'test',
        control,
        defaultValue: '',
      });

      return null;
    };

    render(<Component />);
  });

  describe('checkbox', () => {
    it('should work for checkbox by spread the field object', async () => {
      const watchResult: unknown[] = [];
      const Component = () => {
        const { control, watch } = useForm<{
          test: string;
        }>();

        watchResult.push(watch());

        const { field } = useController({
          name: 'test',
          control,
          defaultValue: '',
        });

        return <input type="checkbox" {...field} />;
      };

      render(<Component />);

      expect(watchResult).toEqual([{}]);

      await act(async () => {
        fireEvent.click(screen.getByRole('checkbox'));
      });

      expect(watchResult).toEqual([{}, { test: true }]);

      await act(async () => {
        fireEvent.click(screen.getByRole('checkbox'));
      });

      expect(watchResult).toEqual([{}, { test: true }, { test: false }]);
    });

    it('should work for checkbox by assign checked', async () => {
      const watchResult: unknown[] = [];
      const Component = () => {
        const { control, watch } = useForm<{
          test: string;
        }>();

        watchResult.push(watch());

        const { field } = useController({
          name: 'test',
          control,
          defaultValue: '',
        });

        return (
          <input
            type="checkbox"
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
          />
        );
      };

      render(<Component />);

      expect(watchResult).toEqual([{}]);

      await act(async () => {
        fireEvent.click(screen.getByRole('checkbox'));
      });

      expect(watchResult).toEqual([{}, { test: true }]);

      await act(async () => {
        fireEvent.click(screen.getByRole('checkbox'));
      });

      expect(watchResult).toEqual([{}, { test: true }, { test: false }]);
    });

    it('should work for checkbox by assign value manually', async () => {
      const watchResult: unknown[] = [];
      const Component = () => {
        const { control, watch } = useForm<{
          test: string;
        }>();

        watchResult.push(watch());

        const { field } = useController({
          name: 'test',
          control,
          defaultValue: '',
        });

        return (
          <input
            value="on"
            type="checkbox"
            checked={field.value}
            onChange={(e) =>
              field.onChange(e.target.checked ? e.target.value : false)
            }
          />
        );
      };

      render(<Component />);

      expect(watchResult).toEqual([{}]);

      await act(async () => {
        fireEvent.click(screen.getByRole('checkbox'));
      });

      expect(watchResult).toEqual([{}, { test: 'on' }]);

      await act(async () => {
        fireEvent.click(screen.getByRole('checkbox'));
      });

      expect(watchResult).toEqual([{}, { test: 'on' }, { test: false }]);
    });
  });
});
