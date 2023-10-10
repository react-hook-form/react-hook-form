import React, { PropsWithChildren } from 'react';
import {
  useForm,
  useFormContext,
  useController,
  FormProvider,
  ValidationMode,
  Controller,
  useFormState,
} from 'react-hook-form';
import ReactSelect from 'react-select';

import { useParams } from 'react-router-dom';

let renderCount = 0;
let renderCount2 = 0;
let renderCount3 = 0;

type Form = {
  firstName: string;
  lastName: string;
  work: {
    name: string;
    position: string;
  };
};

const defaultValues: Form = {
  firstName: '',
  lastName: '',
  work: {
    name: '',
    position: 'developer',
  },
};

const PureReactSelect = React.memo(ReactSelect);

function Section({ children, focus }: PropsWithChildren<{ focus?: boolean }>) {
  return (
    <section
      style={{
        borderLeftStyle: 'solid',
        borderLeftWidth: '2px',
        borderLeftColor: focus ? 'grey' : 'transparent',
        paddingLeft: '4px',
        marginBottom: '4px',
      }}
    >
      {children}
    </section>
  );
}

export function WorkSection() {
  const { register, getFieldState } = useFormContext<Form>();
  const { errors, focusField } = useFormState<Form>();

  renderCount2++;
  return (
    <Section focus={getFieldState('work').isActive}>
      <Section focus={getFieldState('work.name').isActive}>
        <input
          placeholder="work.name"
          {...register('work.name', { required: true, minLength: 2 })}
        />
        {errors.work?.name && <p>work.name error</p>}
      </Section>

      <Section focus={getFieldState('work.position').isActive}>
        <input
          placeholder="work.position"
          {...register('work.position', { required: true, minLength: 2 })}
        />
        {errors.work?.position && <p>work.position error</p>}
      </Section>
      {renderCount2}
    </Section>
  );
}

function LastName() {
  const { field, fieldState } = useController({
    name: 'lastName',
    rules: { required: true, minLength: 2 },
  });

  renderCount3++;
  return (
    <Section focus={fieldState.isActive}>
      <input {...field} placeholder={field.name} />{' '}
      {fieldState.invalid && <p>{fieldState.error?.type}</p>}
      {renderCount3}
    </Section>
  );
}

function FormStatus() {
  const formState = useFormState();
  return <p>focusField: {String(formState.focusField)}</p>;
}

export default function Focus() {
  const { mode } = useParams();
  const methods = useForm<Form>({
    defaultValues,
    mode: mode as keyof ValidationMode,
  });

  const { handleSubmit, formState, control } = methods;

  renderCount++;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(() => {})}>
        <Controller
          name="firstName"
          control={control}
          rules={{ required: true, minLength: 2 }}
          render={({ field, fieldState }) => (
            <Section focus={fieldState.isActive}>
              <input {...field} placeholder={field.name} />
              {fieldState.invalid && <p>{fieldState.error?.type}</p>}
            </Section>
          )}
        />

        <LastName />

        <WorkSection />

        <Section>
          <button id="submit">submit</button>
        </Section>

        <p id="renderCount">{renderCount}</p>
        <FormStatus />
      </form>
    </FormProvider>
  );
}
