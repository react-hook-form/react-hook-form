import type { FieldValues, FormState, UseFormReturn } from '../types';

export function updateMethodsReference<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
>(
  methods: UseFormReturn<TFieldValues, TContext, TTransformedValues>,
  formState: FormState<TFieldValues>,
): UseFormReturn<TFieldValues, TContext, TTransformedValues> {
  return {
    ...methods,
    formState,
    watch: methods.watch.bind(null),
    getValues: methods.getValues.bind(null),
    getErrors: methods.getErrors.bind(null),
    getFieldState: methods.getFieldState.bind(null),
    register: methods.register.bind(null),
  };
}
