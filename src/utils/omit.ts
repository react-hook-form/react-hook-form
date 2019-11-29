interface OmitObject {
  <T, K extends keyof T>(obj: T, key: K): any;
}

const omitObject: OmitObject = (obj, key) => {
  const { [key]: omitted, ...rest } = obj;
  return rest;
};

export default omitObject;
