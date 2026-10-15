import type { Control, FieldValues, FormState } from '../types';

export default <TFieldValues extends FieldValues>(
  control: Pick<Control<TFieldValues>, '_formState' | '_defaultValues'>,
  formState?: Partial<FormState<TFieldValues>>,
): FormState<TFieldValues> => ({
  ...control._formState,
  ...formState,
  defaultValues:
    control._defaultValues as FormState<TFieldValues>['defaultValues'],
});
