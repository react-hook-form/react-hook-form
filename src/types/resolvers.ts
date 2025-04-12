import { FieldErrors } from './errors';
import { Field, FieldName, FieldValues, InternalFieldName } from './fields';
import { CriteriaMode } from './form';

export type ResolverSuccess<TTransformedValues> = {
  values: TTransformedValues;
  errors: {};
};

export type ResolverError<TFieldValues extends FieldValues = FieldValues> = {
  values: {};
  errors: FieldErrors<TFieldValues>;
};

export type ResolverResult<
  TFieldValues extends FieldValues = FieldValues,
  TTransformedValues = TFieldValues,
> = ResolverSuccess<TTransformedValues> | ResolverError<TFieldValues>;

export interface ResolverOptions<TFieldValues extends FieldValues> {
  criteriaMode?: CriteriaMode;
  fields: Record<InternalFieldName, Field['_f']>;
  names?: FieldName<TFieldValues>[];
  shouldUseNativeValidation: boolean | undefined;
}

export type Resolver<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
> = (
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) =>
  | Promise<ResolverResult<TFieldValues, TTransformedValues>>
  | ResolverResult<TFieldValues, TTransformedValues>;
