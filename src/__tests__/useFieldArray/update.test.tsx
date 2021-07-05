import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { VALIDATION_MODE } from '../../constants';
import { useFieldArray } from '../../useFieldArray';
import { useForm } from '../../useForm';
import { mockGenerateId } from '../useFieldArray.test';

describe('update', () => {
  beforeEach(() => {
    mockGenerateId();
  });

  it('should update dirtyFields fields correctly', async () => {
    let dirtyInputs = {};
    const Component = () => {
      const {
        register,
        control,
        formState: { dirtyFields },
      } = useForm<{
        test: { value: string }[];
      }>({
        defaultValues: {
          test: [
            { value: 'plz change' },
            { value: 'dont change' },
            { value: 'dont change' },
          ],
        },
      });
      const { fields, update } = useFieldArray({
        control,
        name: 'test',
      });

      dirtyInputs = dirtyFields;

      return (
        <form>
          {fields.map((field, i) => (
            <input key={field.id} {...register(`test.${i}.value` as const)} />
          ))}
          <button type="button" onClick={() => update(0, { value: 'changed' })}>
            update
          </button>
          {dirtyFields.test?.length && 'dirty'}
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => screen.getByText('dirty'));

    expect(dirtyInputs).toEqual({
      test: [{ value: true }],
    });
  });

  it.each(['isDirty', 'dirtyFields'])(
    'should be dirtyFields when value is appended with %s',
    () => {
      let isDirtyValue;
      let dirtyValue;

      const Component = () => {
        const {
          register,
          control,
          formState: { isDirty, dirtyFields },
        } = useForm<{
          test: { test: string }[];
        }>({
          defaultValues: {},
        });
        const { fields, update } = useFieldArray({
          control,
          name: 'test',
        });

        isDirtyValue = isDirty;
        dirtyValue = dirtyFields;

        return (
          <form>
            {fields.map((field, index) => {
              return (
                <input
                  key={field.id}
                  {...register(`test.${index}.test` as const)}
                />
              );
            })}
            <button
              type={'button'}
              onClick={() => update(2, { test: 'test1' })}
            >
              update
            </button>
          </form>
        );
      };

      render(<Component />);

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'update' }));
      });

      expect(isDirtyValue).toBeTruthy();
      expect(dirtyValue).toEqual({
        test: [undefined, undefined, { test: true }],
      });
    },
  );

  it('should trigger reRender when user update input and is watching the all field array', () => {
    const watched: any[] = [];
    const Component = () => {
      const { register, watch, control } = useForm<{
        test: { value: string }[];
      }>();
      const { fields, update } = useFieldArray({
        control,
        name: 'test',
      });
      watched.push(watch());

      return (
        <form>
          {fields.map((field, i) => (
            <input key={field.id} {...register(`test.${i}.value` as const)} />
          ))}
          <button type="button" onClick={() => update(0, { value: '' })}>
            update
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /update/i }));

    expect(watched).toMatchSnapshot();
  });

  it('should return watched value with update and watch API', async () => {
    const renderedItems: any = [];
    const Component = () => {
      const { watch, register, control } = useForm<{
        test: { value: string }[];
      }>();
      const { fields, update } = useFieldArray({
        name: 'test',
        control,
      });
      const watched = watch('test');
      renderedItems.push(watched);
      return (
        <div>
          {fields.map((field, i) => (
            <div key={field.id}>
              <input {...register(`test.${i}.value` as const)} />
            </div>
          ))}
          <button onClick={() => update(0, { value: 'test' })}>update</button>
        </div>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /update/i }));

    await waitFor(() =>
      expect(renderedItems).toEqual([
        undefined,
        [],
        [{ value: 'test' }],
        [{ value: 'test' }],
      ]),
    );
  });

  describe('with resolver', () => {
    it('should invoke resolver when formState.isValid true', async () => {
      const resolver = jest.fn().mockReturnValue({});

      const { result } = renderHook(() => {
        const { formState, control } = useForm({
          mode: VALIDATION_MODE.onChange,
          resolver,
        });
        const { update } = useFieldArray({ control, name: 'test' });
        return { formState, update };
      });

      result.current.formState.isValid;

      await act(async () => {
        result.current.update(0, { value: '1' });
      });

      expect(resolver).toBeCalledWith(
        {
          test: [{ value: '1' }],
        },
        undefined,
        {
          criteriaMode: undefined,
          fields: {
            test: [
              {
                value: {
                  mount: true,
                  name: 'test.0.value',
                  ref: {
                    name: 'test.0.value',
                    value: '1',
                  },
                  value: '1',
                },
              },
            ],
          },
          names: ['test.0.value'],
        },
      );
    });

    it('should not invoke resolver when formState.isValid false', () => {
      const resolver = jest.fn().mockReturnValue({});

      const { result } = renderHook(() => {
        const { formState, control } = useForm({
          mode: VALIDATION_MODE.onChange,
          resolver,
        });
        const { update } = useFieldArray({ control, name: 'test' });
        return { formState, update };
      });

      act(() => {
        result.current.update(0, { value: '1' });
      });

      expect(resolver).not.toBeCalled();
    });
  });
});
