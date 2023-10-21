import type { MetaFunction, ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { setTimeout } from 'timers/promises';
import { createActionValidator } from 'react-hook-form/server';
import { useForm } from 'react-hook-form';
import { zodResolverSync } from '../../node_modules/@hookform/resolvers/zod';
import { z } from 'zod';

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

let count = 0;
const maxCount = 1;

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  await setTimeout(1000);

  const validator = createActionValidator(formData, {
    resolver: zodResolverSync(schema),
  });

  await validator.validate();

  if (!validator.isValid()) {
    return json(validator.getResult());
  }

  if (Math.random() < 0.5) {
    validator.setError('root.serverError', {
      type: '409',
      message: 'Username already exists. Please choose a different username.',
    });
    return json(validator.getResult());
  }

  if (Math.random() < 0.5) {
    count++;
    if (count > maxCount) {
      validator.setError('root.serverError', {
        type: '401',
        message: 'Too many login attempts.',
      });
      return json(validator.getResult());
    }

    validator.setError('root.serverError', {
      type: '401',
      message: 'Invalid username or password.',
    });
    return json(validator.getResult());
  }

  if (Math.random() < 0.5) {
    validator.setError('root.serverError', {
      type: '500',
      message: 'Internal server error. Please try again later.',
    });
  }

  return json({ status: 200, message: 'Login successful!' });
}

export default function Index() {
  const actionData = useActionData<typeof action>();
  console.log('actionData', actionData);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    username: string;
    password: string;
  }>({
    resolver: zodResolverSync(schema),
    defaultValues: actionData?.values || {
      username: '',
      password: '',
    },
    errors: actionData?.errors,
    progressive: true,
  });

  console.log('errors', errors);

  return (
    <Form method="post" onSubmit={handleSubmit()}>
      <label>Username</label>
      <input {...register('username')} placeholder="Username" />
      {errors.username && <p>{errors.username.message}</p>}
      <label>Password</label>
      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <p>{errors.password.message}</p>}
      <input type="submit" />
      {errors.root?.serverError && <p>{errors.root.serverError.message}</p>}
    </Form>
  );
}
