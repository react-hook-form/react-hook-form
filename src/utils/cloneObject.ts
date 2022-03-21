import structuredClone from 'core-js-pure/actual/structured-clone';

export default function cloneObject<T>(data: T): T {
  return structuredClone(data);
}
