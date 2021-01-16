import { EmptyObject } from './utils';
import { CriteriaMode, UnpackNestedValue } from './form';
import { Field, FieldValues } from './fields';
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

export interface ResolverOptions {
  criteriaMode?: CriteriaMode;
  fields?: Field[];
}

export type Resolver<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
> = (
  values: UnpackNestedValue<TFieldValues>,
  context?: TContext,
  options?: ResolverOptions,
) => Promise<ResolverResult<TFieldValues>> | ResolverResult<TFieldValues>;
