interface ValidationReturn {
  [key: string]: string;
}

export function parseErrorSchema(error): ValidationReturn {
  return error.inner.reduce((previous, current, index): ValidationReturn => {
    if (!previous[current.path]) previous[current.path] = {};
    previous[current.path] = error.errors[index];
    return previous;
  }, {});
}

export default async function validateWithSchema(
  ValidationSchema,
  data,
): Promise<ValidationReturn | undefined> {
  try {
    await ValidationSchema.validate(data, { abortEarly: false });
    return {};
  } catch (e) {
    return parseErrorSchema(e);
  }
}
