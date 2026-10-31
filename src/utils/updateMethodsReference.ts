import type { FieldValues, UseFormReturn } from '../types';

export function updateMethodsReference<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
>(
  target: UseFormReturn<TFieldValues, TContext, TTransformedValues>,
  source: UseFormReturn<TFieldValues, TContext, TTransformedValues>,
) {
  target.watch = source.watch.bind(null);
  target.getValues = source.getValues.bind(null);
  target.getErrors = source.getErrors.bind(null);
  target.getFieldState = source.getFieldState.bind(null);
  target.register = source.register.bind(null);
}
