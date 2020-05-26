import React from 'react';
import { useForm, Resolver } from 'react-hook-form';

type FormValues = {
  firstName: string;
  lastName: string;
};

const resolver: Resolver<FormValues> = async (values) => {
  return {
    values: !values.firstName ? {} : values,
    errors: !values.firstName
      ? {
          firstName: {
            type: 'required',
            message: 'This is required.',
          },
        }
      : {},
  };
};

export default function App() {
  const { register, handleSubmit, errors } = useForm<FormValues>({
    resolver: resolver,
  });
  const onSubmit = handleSubmit((data) => alert(JSON.stringify(data)));

  return (
    <div className="App">
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="firstName">First Name</label>
          <input name="firstName" placeholder="Kotaro" ref={register} />
          {errors?.firstName && <p>{errors.firstName.message}</p>}
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input name="lastName" placeholder="Sugawara" ref={register} />
        </div>

        <input type="submit" />
      </form>
    </div>
  );
}
