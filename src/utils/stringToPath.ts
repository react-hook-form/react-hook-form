const FIELD_PATH_RE = /[.[\]'"]/;
const MAX_CACHE_SIZE = 1000;
const cache = new Map<string, readonly string[]>();

export default (input: string): readonly string[] => {
  let path = cache.get(input);

  if (!path) {
    path = input.split(FIELD_PATH_RE).filter(Boolean);

    if (cache.size >= MAX_CACHE_SIZE) {
      cache.delete(cache.keys().next().value as string);
    }

    cache.set(input, path);
  }

  return path;
};
