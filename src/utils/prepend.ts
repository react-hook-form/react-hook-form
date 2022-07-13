import convertToArrayPayload from './convertToArrayPayload';

export default function prepend<T>(data: T[], value: T | T[]): T[] {
  return [...convertToArrayPayload(value), ...convertToArrayPayload(data)];
}
