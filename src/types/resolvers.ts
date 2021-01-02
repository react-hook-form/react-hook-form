import { EmptyObject } from './utils';
import { UnpackNestedValue } from './form';
import { FieldValues } from './fields';
import { FieldErrors } from './errors';

export type ResolverSuccess<TFieldValues extends FieldValues = FieldValues> = {
  values: UnpackNestedValue<TFieldValues>;
  errors: EmptyObject;
};

export type ResolverError<TFieldValues extends FieldValues = FieldValues> = {
  values: EmptyObject;
  errors: FieldErrors<TFieldValues>;
};

export type ResolverResult<TFieldValues extends FieldValues = FieldValues> =
  | ResolverSuccess<TFieldValues>
  | ResolverError<TFieldValues>;

export type Resolver<V = FieldValues, C = Record<string, any>> = <
  TFieldValues extends FieldValues = V,
  TContext extends Record<string, any> = C
>(
  values: UnpackNestedValue<TFieldValues>,
  context?: TContext,
  validateAllFieldCriteria?: boolean,
) => Promise<ResolverResult<TFieldValues>> | ResolverResult<TFieldValues>;
