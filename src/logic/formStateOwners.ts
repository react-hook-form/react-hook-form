import type { FieldValues, FormState } from '../types';

export type FormStateOwner = {
  formState?: FormState<FieldValues>;
  listeners: Set<() => void>;
};

/**
 * Maps each `formState` proxy created by `useForm` to its hook instance, so
 * `FormProvider` can catch up when a memoized parent (React Compiler) passes
 * an outdated one.
 */
export const formStateOwners = new WeakMap<object, FormStateOwner>();
