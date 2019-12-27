interface OmitObject {
  <T, K extends keyof T>(obj: T, key: K): any;
}

const omitObject: OmitObject = (obj, key) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [key]: omitted, ...rest } = obj;
  return rest;
};

export default omitObject;
