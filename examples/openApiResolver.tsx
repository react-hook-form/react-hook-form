import React, { useEffect, useState } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import oas2joi from 'oas2joi';
import set from 'lodash.set';

interface Schema {
  validate: (
    values: any,
    options?: { abortEarly?: boolean },
  ) => {
    error?: {
      details: { message: string; path: string[] }[];
    };
    value: any;
  };
}

let storedSchemas: { [key: string]: Schema } | undefined;

async function getSchemas() {
  if (!storedSchemas) {
    storedSchemas = await oas2joi('schema.oa3.json');
  }
  return storedSchemas;
}

function createResolver(schema: Schema) {
  return async function resolver(data: any) {
    const { error, value: values } = schema.validate(data, {
      abortEarly: false,
    });

    return {
      values: error ? {} : values,
      errors: error
        ? error.details.reduce(
            (errors, { message, path }) =>
              set({ ...errors }, path.join('.'), { message }),
            {},
          )
        : {},
    };
  };
}

interface FormValues {
  username: string;
}

interface FormContext {
  resolver: Resolver<any>;
}

export default function OpenApiResolver() {
  const [userResolver, setUserResolver] = useState<Resolver<any>>();

  useEffect(() => {
    getSchemas().then((schemas) => {
      if (schemas?.user) {
        setUserResolver(() => createResolver(schemas.user));
      }
    });
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
