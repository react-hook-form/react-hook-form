import * as React from 'react';
import { createPortal } from 'react-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Control } from '../types';
import { useForm } from '../useForm';
import { FormProvider } from '../useFormContext';
import { useFormState } from '../useFormState';

describe('useFormState', () => {
  it('should render correct form state with isDirty, dirty, touched', () => {
    let count = 0;
    const Test = ({
      control,
    }: {
      control: Control<{
        test: string;
      }>;
    }) => {
      const { isDirty, dirtyFields, touchedFields } = useFormState({
        control,
      });

      return (
        <>
          <div>{isDirty ? 'isDirty' : ''}</div>
          <div>{dirtyFields['test'] ? 'dirty field' : ''}</div>
          <div>{touchedFields['test'] ? 'isTouched' : ''}</div>
        </>
      );
    };

    const Component = () => {
      const { register, control } = useForm<{
        test: string;
      }>();

      count++;

      return (
        <div>
          <input aria-label="test" {...register('test')} />
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
          <input aria-label="test" {...register('test', { minLength: 5 })} />
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
      const { touchedFields } = useFormState({
        control,
      });

      test1Count++;

      return (
        <>
          <div>{touchedFields['test'] ? 'isTouched' : 'notTouched'}</div>
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
          <input aria-label="test" {...register('test', { minLength: 5 })} />
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
    expect(testCount).toEqual(3);
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

  it('should only re-render when subscribed field name updated', async () => {
    let count = 0;

    type FormValues = {
      firstName: string;
      lastName: string;
    };

    const Test = ({ control }: { control: Control<FormValues> }) => {
      const { errors } = useFormState({
        control,
        name: 'firstName',
      });

      count++;

      return <>{errors?.firstName?.message}</>;
    };

    const Component = () => {
      const { control, register } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: {
          firstName: 'a',
          lastName: 'b',
        },
      });

      return (
        <form>
          <Test control={control} />
          <input
            {...register('firstName', { required: true })}
            placeholder={'firstName'}
          />
          <input {...register('lastName')} />
        </form>
      );
    };

    render(<Component />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('firstName'), {
        target: {
          value: '',
        },
      });
    });

    expect(count).toEqual(2);
  });

  it('should not re-render when subscribed field name is not included', async () => {
    let count = 0;

    type FormValues = {
      firstName: string;
      lastName: string;
    };

    const Test = ({ control }: { control: Control<FormValues> }) => {
      const { errors } = useFormState({
        control,
        name: 'lastName',
      });

      count++;

      return <>{errors?.lastName?.message}</>;
    };

    const Component = () => {
      const { control, register } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: {
          firstName: 'a',
          lastName: 'b',
        },
      });

      return (
        <form>
          <Test control={control} />
          <input
            {...register('firstName', { required: true })}
            placeholder={'firstName'}
          />
          <input {...register('lastName')} />
        </form>
      );
    };

    render(<Component />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('firstName'), {
        target: {
          value: '',
        },
      });
    });

    expect(count).toEqual(1);
  });

  it('should only re-render when subscribed field names updated', async () => {
    let count = 0;

    type FormValues = {
      firstName: string;
      lastName: string;
      age: number;
    };

    const Test = ({ control }: { control: Control<FormValues> }) => {
      const { errors } = useFormState({
        control,
        name: ['firstName', 'lastName'],
      });

      count++;

      return <>{errors?.firstName?.message}</>;
    };

    const Component = () => {
      const { control, register } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: {
          firstName: 'a',
          lastName: 'b',
        },
      });

      return (
        <form>
          <Test control={control} />
          <input
            {...register('firstName', { required: true })}
            placeholder={'firstName'}
          />
          <input
            {...register('lastName', { required: true })}
            placeholder={'lastName'}
          />
          <input
            {...register('age', { valueAsNumber: true, required: true })}
            type="number"
          />
        </form>
      );
    };

    render(<Component />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('firstName'), {
        target: {
          value: '',
        },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('lastName'), {
        target: {
          value: '',
        },
      });
    });

    expect(count).toEqual(3);
  });

  it('should only re-render when subscribed field names updated', async () => {
    let count = 0;

    type FormValues = {
      firstName: string;
      lastName: string;
      age: number;
    };

    const Test = ({ control }: { control: Control<FormValues> }) => {
      const { errors } = useFormState({
        control,
        name: ['age', 'lastName'],
      });

      count++;

      return <>{errors?.firstName?.message}</>;
    };

    const Component = () => {
      const { control, register } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: {
          firstName: 'a',
          lastName: 'b',
        },
      });

      return (
        <form>
          <Test control={control} />
          <input
            {...register('firstName', { required: true })}
            placeholder={'firstName'}
          />
          <input {...register('lastName')} placeholder={'lastName'} />
          <input
            {...register('age', { valueAsNumber: true, required: true })}
            type="number"
          />
        </form>
      );
    };

    render(<Component />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('firstName'), {
        target: {
          value: '',
        },
      });
    });

    expect(count).toEqual(1);
  });

  it('should be able to stop the formState subscription', async () => {
    type FormValues = {
      test: string;
    };

    function Child({ control }: { control: Control<FormValues> }) {
      const [disabled, setDisabled] = React.useState(true);
      const { errors } = useFormState({
        control,
        name: 'test',
        disabled,
      });

      return (
        <div>
          {errors.test && <p>error</p>}
          <button onClick={() => setDisabled(!disabled)}>toggle</button>
        </div>
      );
    }

    const App = () => {
      const { trigger, register, control } = useForm<FormValues>();

      return (
        <div>
          <input {...register('test', { required: true })} />
          <Child control={control} />
          <button
            onClick={() => {
              trigger();
            }}
          >
            trigger
          </button>
        </div>
      );
    };

    render(<App />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'trigger' }));
    });

    expect(screen.queryByText('error')).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'trigger' }));
    });

    screen.getByText('error');
  });

  describe('When nested forms are in portals', () => {
    it('Should validate forms independently', async () => {
      const portal = document.createElement('div');
      portal.setAttribute('id', 'portal');
      document.body.appendChild(portal);

      function PortalForm() {
        const methods = useForm();
        const { isSubmitted } = useFormState({ control: methods.control });
        const portal = document.getElementById('portal');

        return (
          portal &&
          createPortal(
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(() => void 0)}>
                <h2>Is child submitted: {isSubmitted ? 'yes' : 'no'}</h2>
                <button type="submit">submit</button>
              </form>
            </FormProvider>,
            portal,
          )
        );
      }

      function MainForm() {
        const methods = useForm();
        const { isSubmitted } = useFormState({ control: methods.control });
        return (
          <FormProvider {...methods}>
            <form onSubmit={() => void 0}>
              <h1>Is parent submitted: {isSubmitted ? 'yes' : 'no'}</h1>
              <PortalForm />
            </form>
          </FormProvider>
        );
      }

      render(<MainForm />);
      await act(async () => {
        await fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      });

      expect(screen.getByText(/is child submitted: yes/i)).toBeInTheDocument();
      expect(screen.getByText(/is parent submitted: no/i)).toBeInTheDocument();
    });
  });
});
