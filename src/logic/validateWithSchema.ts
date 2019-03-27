function parseErrorSchema(error) {
  return error.inner.reduce((previous, current, index) => {
    if (!previous[current.path]) previous[current.path] = {};
    previous[current.path][current.type] = error.errors[index];
    return previous;
  }, {});
}

export default async function validateWithSchema(ValidationSchema, data) {
  try {
    await ValidationSchema.validate(data, { abortEarly: false });
    return undefined;
  } catch (e) {
    return parseErrorSchema(e);
  }
}
