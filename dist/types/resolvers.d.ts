import { FieldErrors } from './errors';
import { Field, FieldName, FieldValues, InternalFieldName } from './fields';
import { CriteriaMode, UnpackNestedValue } from './form';
export declare type ResolverSuccess<TFieldValues extends FieldValues = FieldValues> = {
    values: UnpackNestedValue<TFieldValues>;
    errors: {};
};
export declare type ResolverError<TFieldValues extends FieldValues = FieldValues> = {
    values: {};
    errors: FieldErrors<TFieldValues>;
};
export declare type ResolverResult<TFieldValues extends FieldValues = FieldValues> = ResolverSuccess<TFieldValues> | ResolverError<TFieldValues>;
export interface ResolverOptions<TFieldValues> {
    criteriaMode?: CriteriaMode;
    fields: Record<InternalFieldName, Field['_f']>;
    names?: FieldName<TFieldValues>[];
    shouldUseNativeValidation: boolean | undefined;
}
export declare type Resolver<TFieldValues extends FieldValues = FieldValues, TContext = any> = (values: UnpackNestedValue<TFieldValues>, context: TContext | undefined, options: ResolverOptions<TFieldValues>) => Promise<ResolverResult<TFieldValues>> | ResolverResult<TFieldValues>;
//# sourceMappingURL=resolvers.d.ts.map