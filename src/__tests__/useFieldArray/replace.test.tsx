import React from 'react';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { act } from '@testing-library/react-hooks';

import * as generateId from '../../logic/generateId';
import { useFieldArray } from '../../useFieldArray';
import { useForm } from '../../useForm';

const mockGenerateId = () => {
  let id = 0;
  jest.spyOn(generateId, 'default').mockImplementation(() => (id++).toString());
};

interface TestValue {
  x: string;
}

interface DefaultValues {
  test: TestValue[];
}

describe('replace', () => {
  beforeEach(() => {
    mockGenerateId();
  });

  it('should replace fields correctly', () => {
    let currentFields: any = [];
    const defaultValues: DefaultValues = {
      test: [{ x: '101' }, { x: '102' }, { x: '103' }],
    };

    const labelSingle = 'replace';

    const labelBatch = 'replaceBatch';

    const Component = () => {
      const { register, control } = useForm<DefaultValues>({
        defaultValues,
      });
      const { fields, replace } = useFieldArray({
        control,
        name: 'test',
      });

      currentFields = fields;

      const handleSingleReplace = () => replace({ x: '201' });

      const handleBatchReplace = () => replace([{ x: '301' }, { x: '302' }]);

      return (
        <form>
          {fields.map((field, index) => {
            return (
              <input key={field.id} {...register(`test.${index}.x` as const)} />
            );
          })}
          <button type="button" onClick={handleSingleReplace}>
            {labelSingle}
          </button>
          <button type="button" onClick={handleBatchReplace}>
            {labelBatch}
          </button>
        </form>
      );
    };

    render(<Component />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: labelSingle }));
    });

    act(() => {
      expect(currentFields).toEqual([{ id: '3', x: '201' }]);
    });

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: labelBatch }));
    });

    act(() => {
      expect(currentFields).toEqual([
        { id: '5', x: '301' },
        { id: '6', x: '302' },
      ]);
    });
  });

  it('should not omit keyName when provided', async () => {
    type FormValues = {
      test: {
        test: string;
        id: string;
      }[];
    };

    const App = () => {
      const [data, setData] = React.useState<unknown>([]);
      const { control, register, handleSubmit } = useForm<FormValues>({
        defaultValues: {
          test: [
            { id: '1234', test: 'data' },
            { id: '4567', test: 'data1' },
          ],
        },
      });

      const { fields, replace } = useFieldArray({
        control,
        name: 'test',
      });

      return (
        <form onSubmit={handleSubmit(setData)}>
          {fields.map((field, index) => {
            return <input key={field.id} {...register(`test.${index}.test`)} />;
          })}
          <button
            type={'button'}
            onClick={() => {
              replace([{ id: 'test', test: 'data' }]);
            }}
          >
            replace
          </button>
          <button>submit</button>
          <p>{JSON.stringify(data)}</p>
        </form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'replace' }));

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'submit' }));
    });

    screen.getByText('{"test":[{"id":"test","test":"data"}]}');
  });

  it('should not omit keyName when provided and defaultValue is empty', async () => {
    type FormValues = {
      test: {
        test: string;
        id: string;
      }[];
    };
    let k = 0;

    const App = () => {
      const [data, setData] = React.useState<unknown>([]);
      const { control, register, handleSubmit } = useForm<FormValues>();

      const { fields, append, replace } = useFieldArray({
        control,
        name: 'test',
      });

      return (
        <form onSubmit={handleSubmit(setData)}>
          {fields.map((field, index) => {
            return <input key={field.id} {...register(`test.${index}.test`)} />;
          })}
          <button
            type={'button'}
            onClick={() => {
              replace([{ id: 'whatever', test: 'data' }]);
            }}
          >
            replace
          </button>

          <button
            type={'button'}
            onClick={() => {
              append({
                id: 'whatever' + k,
                test: '1234' + k,
              });
              k = 1;
            }}
          >
            append
          </button>
          <button>submit</button>
          <p>{JSON.stringify(data)}</p>
        </form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'append' }));

    fireEvent.click(screen.getByRole('button', { name: 'append' }));

    fireEvent.click(screen.getByRole('button', { name: 'replace' }));

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'submit' }));
    });

    screen.getByText('{"test":[{"id":"whatever","test":"data"}]}');
  });
});
