import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Controller } from '../controller';
import { Control } from '../types';
import { useController } from '../useController';
import { useForm } from '../useForm';

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

  it('should only subscribe to formState at each useController level', async () => {
    const renderCounter = [0, 0];
    type FormValues = {
      test: string;
      test1: string;
    };

    const Test = ({ control }: { control: Control<FormValues> }) => {
      const { field } = useController({
        name: 'test',
        control,
      });

      renderCounter[0]++;

      return <input {...field} />;
    };

    const Test1 = ({ control }: { control: Control<FormValues> }) => {
      const {
        field,
        fieldState: { isDirty, isTouched },
      } = useController({
        name: 'test1',
        control,
      });

      renderCounter[1]++;

      return (
        <div>
          <input {...field} />
          {isDirty && <p>isDirty</p>}
          {isTouched && <p>isTouched</p>}
        </div>
      );
    };

    const Component = () => {
      const { control } = useForm<FormValues>({
        defaultValues: {
          test: '',
          test1: '',
        },
      });

      return (
        <div>
          <Test control={control} />
          <Test1 control={control} />
        </div>
      );
    };

    render(<Component />);

    expect(renderCounter).toEqual([1, 1]);

    await act(async () => {
      fireEvent.change(screen.getAllByRole('textbox')[1], {
        target: {
          value: '1232',
        },
      });
    });

    screen.getByText('isDirty');

    await act(async () => {
      fireEvent.blur(screen.getAllByRole('textbox')[1]);
    });

    screen.getByText('isTouched');

    expect(renderCounter).toEqual([1, 3]);

    await act(async () => {
      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: {
          value: '1232',
        },
      });
    });

    await act(async () => {
      fireEvent.blur(screen.getAllByRole('textbox')[0]);
    });

    expect(renderCounter).toEqual([3, 3]);
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
            checked={!!field.value}
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
            checked={!!field.value}
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

  it('should subscribe to formState update with trigger re-render at root', () => {
    type FormValues = {
      test: string;
    };
    let counter = 0;

    const Test = ({ control }: { control: Control<FormValues> }) => {
      const { field, formState } = useController({
        control,
        name: 'test',
      });

      return (
        <>
          <input {...field} />
          <p>{formState.dirtyFields.test && 'dirty'}</p>
          <p>{formState.touchedFields.test && 'touched'}</p>
        </>
      );
    };

    const Component = () => {
      const { control } = useForm<FormValues>({
        defaultValues: {
          test: '',
        },
      });
      counter++;

      return <Test control={control} />;
    };

    render(<Component />);

    act(() => {
      fireEvent.change(screen.getByRole('textbox'), {
        target: {
          value: 'test',
        },
      });
    });

    act(() => {
      fireEvent.blur(screen.getByRole('textbox'));
    });

    expect(counter).toEqual(1);

    screen.getByText('dirty');
    screen.getByText('touched');
  });

  it('should not overwrite defaultValues with defaultValue', () => {
    const App = () => {
      const { control } = useForm({
        defaultValues: {
          test: 'bill',
        },
      });

      return (
        <Controller
          render={({ field }) => {
            return <input {...field} />;
          }}
          control={control}
          name={'test'}
          defaultValue={'luo'}
        />
      );
    };

    render(<App />);

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe(
      'bill',
    );
  });

  it('should be able to update input value without ref', () => {
    const App = () => {
      const { control, setValue } = useForm();
      const { field } = useController({
        control,
        name: 'test',
      });

      return (
        <div>
          <input value={field.value} onChange={field.onChange} />
          <button
            onClick={() => {
              setValue('test', 'data');
            }}
          >
            setValue
          </button>
        </div>
      );

      render(<App />);

      fireEvent.click(screen.getByRole('button'));

      expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
        'data',
      );
    };
  });
});
