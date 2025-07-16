import { describe, expect, it } from 'tstyche';
import { z } from 'zod';

import type { FieldError } from '../types';
import { useForm } from '../useForm';

import { zodResolver } from './__fixtures__';

describe('handleSubmit', () => {
  it('should infer the correct defaultValues from useForm', () => {
    const { handleSubmit } = useForm({
      defaultValues: {
        test: '',
        test1: 2,
      },
    });

    handleSubmit((data) =>
      expect(data).type.toBe<{ test: string; test1: number }>(),
    );
  });

  it('should infer the correct defaultValues from useForm generic', () => {
    const { handleSubmit } = useForm<{
      test: string;
      test1: number;
    }>();

    handleSubmit((data) =>
      expect(data).type.toBe<{ test: string; test1: number }>(),
    );
  });

  it('should infer the correct TTransformedValues from useForm resolver', () => {
    const { handleSubmit } = useForm({
      resolver: zodResolver(
        z.object({
          test: z.string(),
          test1: z.number(),
        }),
      ),
    });

    handleSubmit((data) => {
      expect(data).type.toBe<{ test: string; test1: number }>();
    });
  });

  const schema = z.object({
    id: z.number(),
  });

  it('should correctly infer the output type from a schema', () => {
    const form = useForm({
      resolver: zodResolver(schema),
    });

    expect(form.watch('id')).type.toBe<number | undefined>();

    form.handleSubmit((data) => {
      expect(data).type.toBe<{ id: number }>();
    });
  });

  it('should correctly infer the output type from a schema', () => {
    const form = useForm({
      resolver: zodResolver(schema),
    });

    expect(form.watch('id', 4711)).type.toBe<number>();

    form.handleSubmit((data) => {
      expect(data).type.toBe<{ id: number }>();
    });
  });

  it('should correctly infer the output type from a schema', () => {
    const form = useForm({
      resolver: zodResolver(schema),
    });

    expect(form.watch('id', undefined)).type.toBe<number | undefined>();

    form.handleSubmit((data) => {
      expect(data).type.toBe<{ id: number }>();
    });
  });

  it('should correctly infer the output type from a zod schema with a transform', () => {
    const form = useForm({
      resolver: zodResolver(
        z.object({ id: z.number().transform((val) => String(val)) }),
      ),
    });

    form.handleSubmit((data) => {
      expect(data).type.toBe<{ id: string }>();
    });
  });

  it('should infer the correct TTransformedValues from useForm generic', () => {
    const { handleSubmit } = useForm<
      { test: string },
      unknown,
      { test: string } | { test1: number }
    >();

    handleSubmit((data) => {
      expect(data).type.toBe<{ test: string } | { test1: number }>();
    });
  });
});

describe('getFieldState', () => {
  it('should return associated field state', () => {
    const { getFieldState } = useForm({
      defaultValues: {
        test: '',
      },
    });

    expect(getFieldState('test')).type.toBe<{
      invalid: boolean;
      isDirty: boolean;
      isTouched: boolean;
      isValidating: boolean;
      error?: FieldError;
    }>();
  });

  it('should return associated field state when formState is supplied', () => {
    const { getFieldState, formState } = useForm({
      defaultValues: {
        test: '',
      },
    });

    expect(getFieldState('test', formState)).type.toBe<{
      invalid: boolean;
      isDirty: boolean;
      isTouched: boolean;
      isValidating: boolean;
      error?: FieldError;
    }>();
  });
});
