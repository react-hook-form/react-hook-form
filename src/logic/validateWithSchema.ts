export function parseErrorSchema(error): { [key: string]: string } {
  return error.inner.reduce((previous, current, index) => {
    if (!previous[current.path]) previous[current.path] = {};
    previous[current.path] = error.errors[index];
    return previous;
  }, {});
}

export default async function validateWithSchema(
  ValidationSchema,
  data,
): Promise<{ [key: string]: string } | undefined> {
  try {
    await ValidationSchema.validate(data, { abortEarly: false });
    return undefined;
  } catch (e) {
    return parseErrorSchema(e);
  }
}
