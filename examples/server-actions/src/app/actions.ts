'use server';

import { setTimeout } from 'timers/promises';
import { createActionValidator } from 'react-hook-form/server';
import { zodResolver } from '../../node_modules/@hookform/resolvers/zod';

import { schema } from '@/app/schema';

let count = 0;
const maxCount = 1;

export async function login(prevState: any, formData: FormData) {
  await setTimeout(1000);

  const validator = createActionValidator(formData, {
    resolver: zodResolver(schema),
  });

  await validator.validate();

  if (!validator.isValid()) {
    return validator.getResult();
  }

  if (Math.random() < 0.5) {
    validator.setError('root.serverError', {
      type: '409',
      message: 'Username already exists. Please choose a different username.',
    });
    return validator.getResult();
  }

  if (Math.random() < 0.5) {
    count++;
    if (count > maxCount) {
      validator.setError('root.serverError', {
        type: '401',
        message: 'Too many login attempts.',
      });
      return validator.getResult();
    }

    validator.setError('root.serverError', {
      type: '401',
      message: 'Invalid username or password.',
    });
    return validator.getResult();
  }

  if (Math.random() < 0.5) {
    validator.setError('root.serverError', {
      type: '500',
      message: 'Internal server error. Please try again later.',
    });
  }

  return { status: 200, message: 'Login successful!' };
}
