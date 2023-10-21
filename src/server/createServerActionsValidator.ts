import {
  DeepMap,
  DeepPartial,
  ErrorOption,
  FieldErrors,
  FieldPath,
  FieldValues,
  RegisterOptions,
  Resolver,
} from '../types';
import set from '../utils/set';

class ActionValidator<TFieldValues extends FieldValues> {
  private values: TFieldValues;
  private options: { resolver: Resolver<TFieldValues> };
  private rules: DeepMap<
    DeepPartial<TFieldValues>,
    RegisterOptions<TFieldValues>
  > = {} as DeepMap<DeepPartial<TFieldValues>, RegisterOptions<TFieldValues>>;
  private errors: FieldErrors<TFieldValues> = {};

  constructor(
    values: TFieldValues | FormData,
    options: { resolver: Resolver<TFieldValues> },
  ) {
    this.values =
      values instanceof FormData ? this.formDataToValues(values) : values;
    this.options = options;
  }

  private formDataToValues(formData: FormData) {
    return Object.fromEntries(formData.entries()) as TFieldValues;
  }

  public register(
    name: FieldPath<TFieldValues>,
    options: RegisterOptions<TFieldValues>,
  ) {
    set(this.rules, name, options);
    return this;
  }

  public async validate() {
    if (this.options.resolver) {
      const result = await this.options.resolver(this.values, undefined, {
        fields: {},
        shouldUseNativeValidation: false,
      });
      this.errors = {
        ...this.errors,
        ...result.errors,
      };
      return this;
    }
    // TODO: impl native validation
    return this;
  }

  public setError(
    name: FieldPath<TFieldValues> | `root.${string}` | 'root',
    error: ErrorOption,
  ) {
    set(this.errors, name, error);
    return this;
  }

  public getResult(): {
    values: TFieldValues;
    errors: FieldErrors<TFieldValues>;
  } {
    return {
      values: this.values,
      errors: this.errors,
    };
  }

  public isValid() {
    return Object.keys(this.errors).length === 0;
  }
}

export const createActionValidator = <TFieldValues extends FieldValues>(
  values: TFieldValues | FormData,
  options: { resolver: Resolver<TFieldValues> },
) => new ActionValidator(values, options);
