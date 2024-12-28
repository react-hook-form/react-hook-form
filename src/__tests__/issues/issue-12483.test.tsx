import React, { ChangeEventHandler } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import {
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
  useWatch,
} from '../../index';
type FormValues = {
  title: string[];
  description: string[];
};

const defaultValues = {
  title: [''],
  description: [''],
  sorting: '',
};
describe('issue #12484', () => {
  it('DevTool should not cause extra renders', async () => {
    const Title = () => {
      const { control, setValue } = useFormContext<FormValues>();
      const title = useWatch({
        control,
        name: 'title',
      });

      const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setValue('title', [e.currentTarget.value]);
      };

      return (
        <input
          name={'title'}
          data-testid="title"
          onChange={handleChange}
          value={title[0]}
        />
      );
    };

    let descriptionRenderCount = 0;
    const Description = () => {
      const { control } = useFormContext<FormValues>();
      const description = useWatch({
        control,
        name: 'description',
      });
      descriptionRenderCount++;

      return description[0];
    };

    const DevTool = () => {
      const { control } = useFormContext();
      const formState = useFormState({
        control,
      });

      // subscribe to form state as real DevTool does
      formState.isValid;
      formState.isDirty;
      formState.isSubmitted;
      formState.isSubmitSuccessful;
      formState.disabled;
      formState.submitCount;
      formState.isSubmitting;

      return null;
    };

    const Form = () => {
      const form = useForm<FormValues>({
        defaultValues: defaultValues,
      });

      const handleReset = () => {
        form.reset();
      };

      return (
        <FormProvider {...form}>
          <form
            role="form"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <DevTool />
            <Title />
            <Description />
            <button onClick={handleReset}>reset</button>
          </form>
        </FormProvider>
      );
    };

    const { getByText, getByTestId, getByRole } = render(<Form />);

    const form = getByRole('form');

    const titleInput = getByTestId('title');

    fireEvent.input(titleInput, {
      target: {
        value: 'test',
      },
    });

    await waitFor(() =>
      expect(form).toHaveFormValues({
        title: 'test',
      }),
    );

    // reset form
    fireEvent.click(getByText('reset'));

    await waitFor(() =>
      expect(form).toHaveFormValues({
        title: '',
      }),
    );
    const descriptionRenderCountBeforeChangingTitle = descriptionRenderCount;
    fireEvent.input(titleInput, {
      target: {
        value: 'test',
      },
    });
    await waitFor(() =>
      expect(form).toHaveFormValues({
        title: 'test',
      }),
    );
    // description should not rerender when we change title
    expect(descriptionRenderCount).toBe(
      descriptionRenderCountBeforeChangingTitle,
    );
  });
});
