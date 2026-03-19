export const FIELD_ARRAY_INDEX_PATTERN = /\.\d+(\.|$)/;

export default (name: string) =>
  name.substring(0, name.search(FIELD_ARRAY_INDEX_PATTERN)) || name;
