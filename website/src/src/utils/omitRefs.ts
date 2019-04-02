export default (errors: any) =>
  Object.entries(errors).reduce((previous, [key, values]: any) => {
    if (!values.ref) {
      previous[key] = values;
      return previous;
    }

    const { ref, ...rest }: any = values;
    previous[key] = rest;
    return previous;
  }, {});
