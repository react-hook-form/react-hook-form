import stringToPath from '../utils/stringToPath';

export default function getNullAncestorValue(
  control: { _formValues: unknown; _defaultValues: unknown },
  name: string,
) {
  const segments = stringToPath(name);
  let formValues = control._formValues;
  let defaultValues = control._defaultValues;

  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i];
    formValues =
      formValues == null
        ? formValues
        : (formValues as Record<string, unknown>)[key];
    defaultValues =
      defaultValues == null
        ? defaultValues
        : (defaultValues as Record<string, unknown>)[key];

    if (formValues === null || defaultValues === null) {
      return null;
    }
  }

  return undefined;
}
