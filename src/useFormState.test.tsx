import * as React from 'react';
import { useForm } from './useForm';
import { useFormState } from './useFormState';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Control } from './types';

describe('useFormState', () => {
  it('should render correct form state with isDirty, dirtyFields, touched', () => {
    let count = 0;
    const Test = ({ control }: { control: Control }) => {
      const { isDirty, dirtyFields, touched } = useFormState({
        control,
      });

      return (
        <>
          <div>{isDirty ? 'isDirty' : ''}</div>
          <div>{dirtyFields['test'] ? 'dirty field' : ''}</div>
          <div>{touched['test'] ? 'isTouched' : ''}</div>
        </>
      );
    };

    const Component = () => {
      const { register, control } = useForm();

      count++;

      return (
        <div>
          <input name="test" aria-label="test" ref={register} />
          <Test control={control} />
        </div>
      );
    };

    render(<Component />);

    fireEvent.input(screen.getByLabelText('test'), {
      target: {
        value: 'test',
      },
    });

    screen.getByText('isDirty');
    screen.getByText('dirty field');
    expect(count).toEqual(1);

    fireEvent.blur(screen.getByLabelText('test'));
    screen.getByText('isTouched');
    expect(count).toEqual(1);
  });

  it('should render correct isolated errors message', async () => {
    let count = 0;
    const Test = ({ control }: { control: Control }) => {
      const { errors, isValid } = useFormState({
        control,
      });

      return (
        <>
          <div>{errors['test'] ? 'error' : 'valid'}</div>
          <div>{isValid ? 'yes' : 'no'}</div>
        </>
      );
    };

    const Component = () => {
      const { register, control } = useForm({
        mode: 'onChange',
      });

      count++;

      return (
        <div>
          <input
            name="test"
            aria-label="test"
            ref={register({ minLength: 5 })}
          />
          <Test control={control} />
        </div>
      );
    };
    render(<Component />);

    await act(async () => {
      await fireEvent.input(screen.getByLabelText('test'), {
        target: {
          value: 'test',
        },
      });
    });

    screen.getByText('error');
    screen.getByText('no');

    await act(async () => {
      await fireEvent.input(screen.getByLabelText('test'), {
        target: {
          value: 'testtest',
        },
      });
    });

    screen.getByText('valid');
    screen.getByText('yes');

    expect(count).toEqual(1);
  });

  it('should update formState separately with useFormState', async () => {
    let count = 0;
    let testCount = 0;
    let test1Count = 0;

    const Test1 = ({ control }: { control: Control }) => {
      const { isDirty, dirtyFields } = useFormState({
        control,
      });

      testCount++;

      return (
        <>
          <div>
            {dirtyFields['test'] ? 'hasDirtyField' : 'notHasDirtyField'}
          </div>
          <div>{isDirty ? 'isDirty' : 'notDirty'}</div>
        </>
      );
    };

    const Test = ({ control }: { control: Control }) => {
      const { touched } = useFormState({
        control,
      });

      test1Count++;

      return (
        <>
          <div>{touched['test'] ? 'isTouched' : 'notTouched'}</div>
        </>
      );
    };

    const Component = () => {
      const { register, control } = useForm({
        mode: 'onChange',
      });

      count++;

      return (
        <div>
          <input
            name="test"
            aria-label="test"
            ref={register({ minLength: 5 })}
          />
          <Test control={control} />
          <Test1 control={control} />
        </div>
      );
    };

    render(<Component />);

    await act(async () => {
      await fireEvent.input(screen.getByLabelText('test'), {
        target: {
          value: 'test',
        },
      });
    });

    screen.getByText('hasDirtyField');
    screen.getByText('isDirty');

    expect(count).toEqual(1);
    expect(testCount).toEqual(2);
    expect(test1Count).toEqual(1);

    fireEvent.blur(screen.getByLabelText('test'));
    screen.getByText('isTouched');

    expect(count).toEqual(1);
    expect(testCount).toEqual(3);
    expect(test1Count).toEqual(2);

    await act(async () => {
      await fireEvent.input(screen.getByLabelText('test'), {
        target: {
          value: '',
        },
      });
    });

    expect(count).toEqual(1);
    expect(testCount).toEqual(4);
    expect(test1Count).toEqual(2);
  });

  it('should render correct submit state', async () => {
    let count = 0;
    const Test = ({ control }: { control: Control }) => {
      const { isSubmitted, submitCount } = useFormState({
        control,
      });

      return (
        <>
          <div>{isSubmitted ? 'isSubmitted' : ''}</div>
          <div>{submitCount}</div>
        </>
      );
    };

    const Component = () => {
      const { control, handleSubmit } = useForm();

      count++;

      return (
        <form onSubmit={handleSubmit(() => {})}>
          <Test control={control} />
          <button>Submit</button>
        </form>
      );
    };

    render(<Component />);

    await act(async () => {
      await fireEvent.click(screen.getByRole('button'));
    });

    screen.getByText('isSubmitted');
    screen.getByText('1');

    expect(count).toEqual(1);
  });
});
