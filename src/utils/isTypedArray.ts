export default (value: unknown) =>
  value instanceof Int8Array ||
  value instanceof Uint8Array ||
  value instanceof Uint8ClampedArray ||
  value instanceof Int16Array ||
  value instanceof Uint16Array ||
  value instanceof Int32Array ||
  value instanceof Uint32Array ||
  value instanceof Float32Array ||
  value instanceof Float64Array ||
  value instanceof BigInt64Array ||
  value instanceof BigUint64Array;
