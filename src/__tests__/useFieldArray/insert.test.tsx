import * as React from 'react';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { VALIDATION_MODE } from '../../constants';
import { useFieldArray } from '../../useFieldArray';
import { useForm } from '../../useForm';
import { mockGenerateId } from '../useFieldArray.test';

describe('insert', () => {
  beforeEach(() => {
    mockGenerateId();
  });

  it('should insert data at index with single value', () => {
    const { result } = renderHook(() => {
      const { control } = useForm({
        defaultValues: {
          test: [{ test: '1' }, { test: '2' }],
        },
      });
      const { fields, insert } = useFieldArray({
        control,
        name: 'test',
      });
      return { fields, insert };
    });

    act(() => {
      result.current.insert(1, { test: '3' });
    });

    expect(result.current.fields).toEqual([
      { id: '0', test: '1' },
      { id: '2', test: '3' },
      { id: '1', test: '2' },
    ]);
  });

  it('should insert data at index with array value', () => {
    const { result } = renderHook(() => {
      const { control } = useForm({
        defaultValues: {
          test: [{ test: '1' }, { test: '2' }],
        },
      });
      const { fields, insert } = useFieldArray({
        control,
        name: 'test',
      });
      return { fields, insert };
    });

    act(() => {
      result.current.insert(1, [{ test: '3' }, { test: '4' }]);
    });

    expect(result.current.fields).toEqual([
      { id: '0', test: '1' },
      { id: '2', test: '3' },
      { id: '3', test: '4' },
      { id: '1', test: '2' },
    ]);
  });

  it.each(['isDirty', 'dirtyFields'])(
    'should insert data to formState.%s at index with single value',
    () => {
      const { result } = renderHook(() => {
        const { formState, control } = useForm<{
          test: { value: string; value1: string }[];
        }>({
          defaultValues: { test: [{ value: '1' }] },
        });
        const { fields, append, insert } = useFieldArray({
          control,
          name: 'test',
        });

        return { formState, fields, append, insert };
      });

      result.current.formState.isDirty;
      result.current.formState.dirtyFields;

      act(() => {
        result.current.append({ value: '2' });
      });

      act(() => {
        result.current.insert(1, { value1: '3' });
      });

      expect(result.current.formState.isDirty).toBeTruthy();
      expect(result.current.formState.dirtyFields).toEqual({
        test: [undefined, { value: true, value1: true }, { value: true }],
      });
    },
  );

  it.each(['isDirty', 'dirtyFields'])(
    'should insert data to formState.%s at index with array value',
    () => {
      const { result } = renderHook(() => {
        const { formState, control } = useForm<{
          test: { value1: string; value2: string; value: string }[];
        }>({
          defaultValues: { test: [{ value: '1' }] },
        });
        const { fields, append, insert } = useFieldArray({
          control,
          name: 'test',
        });

        return { formState, fields, append, insert };
      });

      result.current.formState.isDirty;
      result.current.formState.dirtyFields;

      act(() => {
        result.current.append({ value: '2' });
      });

      act(() => {
        result.current.insert(1, [{ value1: '3' }, { value2: '4' }]);
      });

      expect(result.current.formState.isDirty).toBeTruthy();
      expect(result.current.formState.dirtyFields).toEqual({
        test: [
          undefined,
          { value1: true, value: true },
          { value2: true },
          { value: true },
        ],
      });
    },
  );

  it('should insert touched fields with single value', () => {
    let touched: any;
    const Component = () => {
      const { register, formState, control } = useForm({
        defaultValues: { test: [{ value: '1' }, { value: '2' }] },
      });
      const { fields, insert } = useFieldArray({
        control,
        name: 'test',
      });

      touched = formState.touchedFields;

      return (
        <form>
          {fields.map((field, i) => (
            <input key={field.id} {...register(`test.${i}.value` as const)} />
          ))}
          <button
            type="button"
            onClick={() => insert(1, { value: `${fields.length}` })}
          >
            insert
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.blur(screen.getAllByRole('textbox')[0]);
    fireEvent.blur(screen.getAllByRole('textbox')[1]);

    fireEvent.click(screen.getByRole('button', { name: /insert/i }));

    expect(touched).toEqual({
      test: [{ value: true }, undefined, { value: true }],
    });
  });

  it('should insert touched fields with array value', () => {
    let touched: any;
    const Component = () => {
      const { register, formState, control } = useForm({
        defaultValues: { test: [{ value: '1' }, { value: '2' }] },
      });
      const { fields, insert } = useFieldArray({
        control,
        name: 'test',
      });

      touched = formState.touchedFields;

      return (
        <form>
          {fields.map((field, i) => (
            <input key={field.id} {...register(`test.${i}.value` as const)} />
          ))}
          <button
            type="button"
            onClick={() =>
              insert(1, [
                { value: `${fields.length}` },
                { value: `${fields.length + 1}` },
              ])
            }
          >
            insert array
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.blur(screen.getAllByRole('textbox')[0]);
    fireEvent.blur(screen.getAllByRole('textbox')[1]);

    fireEvent.click(screen.getByRole('button', { name: /insert array/i }));

    expect(touched).toEqual({
      test: [{ value: true }, undefined, undefined, { value: true }],
    });
  });

  it('should insert error with single value', async () => {
    let errors: any;
    const Component = () => {
      const { register, handleSubmit, control, ...rest } = useForm();
      const { fields, append, insert } = useFieldArray({
        control,
        name: 'test',
      });

      errors = rest.formState.errors;

      return (
        <form onSubmit={handleSubmit(() => {})}>
          {fields.map((field, i) => (
            <input
              key={field.id}
              {...register(`test.${i}.value`, { required: true })}
            />
          ))}
          <button type="button" onClick={() => append({ value: '' })}>
            append
          </button>
          <button type="button" onClick={() => insert(1, { value: '' })}>
            insert
          </button>
          <button>submit</button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /append/i }));
    fireEvent.click(screen.getByRole('button', { name: /append/i }));

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    fireEvent.click(screen.getByRole('button', { name: /insert/i }));

    expect(errors.test[0]).toBeDefined();
    expect(errors.test[1]).toBeUndefined();
    expect(errors.test[2]).toBeDefined();
  });

  it('should insert error with array value', async () => {
    let errors: any;
    const Component = () => {
      const { register, handleSubmit, control, ...rest } = useForm();
      const { fields, append, insert } = useFieldArray({
        control,
        name: 'test',
      });

      errors = rest.formState.errors;

      return (
        <form onSubmit={handleSubmit(() => {})}>
          {fields.map((field, i) => (
            <input
              key={field.id}
              {...register(`test.${i}.value`, { required: true })}
            />
          ))}
          <button type="button" onClick={() => append({ value: '' })}>
            append
          </button>
          <button
            type="button"
            onClick={() => insert(1, [{ value: '' }, { value: '' }])}
          >
            insert array
          </button>
          <button>submit</button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /append/i }));
    fireEvent.click(screen.getByRole('button', { name: /append/i }));

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    fireEvent.click(screen.getByRole('button', { name: /insert array/i }));

    expect(errors.test[0]).toBeDefined();
    expect(errors.test[1]).toBeUndefined();
    expect(errors.test[2]).toBeUndefined();
    expect(errors.test[3]).toBeDefined();
  });

  it('should focus if shouldFocus is true', () => {
    const Component = () => {
      const { register, control } = useForm({
        defaultValues: {
          test: [{ value: '1' }, { value: '2' }],
        },
      });
      const { fields, insert } = useFieldArray({ name: 'test', control });

      return (
        <form>
          {fields.map((field, i) => (
            <input key={field.id} {...register(`test.${i}.value` as const)} />
          ))}
          <button type="button" onClick={() => insert(1, { value: '' })}>
            insert
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /insert/i }));

    const inputs = screen.getAllByRole('textbox');

    expect(inputs).toHaveLength(3);
    expect(document.activeElement).toEqual(inputs[1]);
  });

  it('should not focus if shouldFocus is false', () => {
    const Component = () => {
      const { register, control } = useForm({
        defaultValues: {
          test: [{ value: '1' }, { value: '2' }],
        },
      });
      const { fields, insert } = useFieldArray({ name: 'test', control });

      return (
        <form>
          {fields.map((field, i) => (
            <input key={field.id} {...register(`test.${i}.value` as const)} />
          ))}
          <button
            type="button"
            onClick={() => insert(1, { value: '' }, { shouldFocus: false })}
          >
            insert
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /insert/i }));

    const inputs = screen.getAllByRole('textbox');

    expect(inputs).toHaveLength(3);
    expect(document.activeElement).toEqual(document.body);
  });

  it('should trigger reRender when user is watching the all field array', () => {
    const watched: any[] = [];
    const Component = () => {
      const { register, watch, control } = useForm<{
        test: {
          value: string;
        }[];
      }>();
      const { fields, insert } = useFieldArray({
        control,
        name: 'test',
      });
      watched.push(watch());

      return (
        <form>
          {fields.map((field, i) => (
            <input key={field.id} {...register(`test.${i}.value` as const)} />
          ))}
          <button type="button" onClick={() => insert(0, { value: '' })}>
            insert
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: 'insert' }));

    expect(watched).toEqual([
      {}, // first render
      { test: [] }, // render inside useEffect in useFieldArray
      { test: [{ value: '' }] }, // render inside insert method
      { test: [{ value: '' }] }, // render inside useEffect in useFieldArray
    ]);
  });

  it('should return watched value with watch API', async () => {
    const renderedItems: any = [];
    const Component = () => {
      const { watch, register, control } = useForm<{
        test: {
          value: string;
        }[];
      }>();
      const { fields, append, insert } = useFieldArray({
        name: 'test',
        control,
      });
      const watched = watch('test');
      const isInserted = React.useRef(false);
      if (isInserted.current) {
        renderedItems.push(watched);
      }
      return (
        <div>
          {fields.map((field, i) => (
            <div key={`${field.id}`}>
              <input {...register(`test.${i}.value` as const)} />
            </div>
          ))}
          <button onClick={() => append({ value: '' })}>append</button>
          <button
            onClick={() => {
              insert(1, { value: 'test' });
              isInserted.current = true;
            }}
          >
            insert
          </button>
        </div>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /append/i }));
    fireEvent.click(screen.getByRole('button', { name: /append/i }));

    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], {
      target: { name: 'test[0].value', value: '111' },
    });
    fireEvent.change(inputs[1], {
      target: { name: 'test[1].value', value: '222' },
    });

    fireEvent.click(screen.getByRole('button', { name: /insert/i }));

    expect(renderedItems).toEqual([
      [{ value: '111' }, { value: 'test' }, { value: '222' }],
      [{ value: '111' }, { value: 'test' }, { value: '222' }],
    ]);
  });

  describe('with resolver', () => {
    it('should invoke resolver when formState.isValid true', async () => {
      const resolver = jest.fn().mockReturnValue({});

      const { result } = renderHook(() => {
        const { formState, control } = useForm({
          mode: VALIDATION_MODE.onChange,
          resolver,
        });
        const { insert } = useFieldArray({ control, name: 'test' });
        return { formState, insert };
      });

      result.current.formState.isValid;

      await act(async () => {
        result.current.insert(0, { value: '1' });
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
        const { insert } = useFieldArray({ control, name: 'test' });
        return { formState, insert };
      });

      act(() => {
        result.current.insert(0, { value: '1' });
      });

      expect(resolver).not.toBeCalled();
    });
  });
});
