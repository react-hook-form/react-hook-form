import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('should not replace errors state', async () => {
    const App = () => {
      const {
        control,
        register,
        trigger,
        formState: { errors },
      } = useForm({
        defaultValues: {
          test: [
            {
              firstName: '',
            },
          ],
        },
      });
      const { fields, replace } = useFieldArray({
        name: 'test',
        control,
      });

      React.useEffect(() => {
        trigger();
      }, [trigger]);

      return (
        <form>
          {fields.map((field, i) => (
            <input
              key={field.id}
              {...register(`test.${i}.firstName` as const, {
                required: 'This is required',
              })}
            />
          ))}
          <p>{errors.test?.[0].firstName?.message}</p>
          <button
            type={'button'}
            onClick={() =>
              replace([
                {
                  firstName: 'firstName',
                },
              ])
            }
          >
            update
          </button>
        </form>
      );
    };

    render(<App />);

    await waitFor(async () => {
      screen.getByText('This is required');
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(async () => {
      screen.getByText('This is required');
    });
  });
});
