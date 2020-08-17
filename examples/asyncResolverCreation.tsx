import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type Resolver = (values: any) => { values: any; errors: any };

async function createUserResolver() {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return (values: any) => {
    if (
      typeof values?.username === "string" &&
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
            "The username is required and has to be between 3 and 30 characters long!",
        },
      },
    };
  };
}

export default function AsyncResolverCreation() {
  const [userResolver, setUserResolver] = useState<Resolver>();

  useEffect(() => {
    createUserResolver().then((userResolver) =>
      setUserResolver(() => userResolver)
    );
  }, []);

  const { register, handleSubmit, errors } = useForm({
    resolver: async (values: any, context: any) =>
      context.resolver(values, context),
    context: {
      resolver: userResolver ?? ((values: any) => ({ values, errors: {} })),
    },
    mode: "onChange",
  });

  const onSubmit = (values: any) => {
    alert(JSON.stringify(values));
  };

  return (
    <div className="App">
      <h1>resolver</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Username</label>
        <input type="text" name="username" ref={register} />
        {errors.username && <p>{errors.username.message}</p>}
        {!userResolver && <p>Validation is being prepared...</p>}
        <p>
          <input disabled={!userResolver} type="submit" />
        </p>
      </form>
    </div>
  );
}
