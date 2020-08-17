import React, { useEffect, useState } from 'react';
import { useForm, Resolver } from 'react-hook-form';

interface FormValues {
  username: string;
}

interface FormContext {
  resolver: Resolver<any>;
}

async function createUserResolver(): Promise<Resolver<any>> {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const userResolver: Resolver<any> = (values: any) => {
    if (
      typeof values?.username === 'string' &&
      values.username.length >= 3 &&
      values.username.length <= 30
    ) {
      return { values, errors: {} };
    }
    return {
      values: {},
      errors: {
        username: {
          message:
            'The username is required and has to be between 3 and 30 characters long!',
        },
      },
    };
  };

  return userResolver;
}

export default function AsyncResolverCreation() {
  const [userResolver, setUserResolver] = useState<Resolver<any>>();

  useEffect(() => {
    createUserResolver().then((userResolver) =>
      setUserResolver(() => userResolver),
    );
  }, []);

  const { register, handleSubmit, errors } = useForm<FormValues, FormContext>({
    resolver: async (values: any, context: any) =>
      context.resolver(values, context),
    context: {
      resolver: userResolver ?? ((values: any) => ({ values, errors: {} })),
    },
    mode: 'onChange',
  });

  const onSubmit = (values: any) => {
    alert(JSON.stringify(values));
  };

  return (
    <div className="App">
      <h1>async resolver creation</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Username</label>
          <input type="text" name="username" ref={register} />
          {errors.username && <p>{errors.username.message}</p>}
        </div>

        {!userResolver && <p>Validation is being prepared...</p>}
        <input disabled={!userResolver} type="submit" />
      </form>
    </div>
  );
}
