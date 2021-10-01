import convertToArrayPayload from './convertToArrayPayload';

export default function append<T>(data: T[], value: T | T[]): T[] {
  return [...convertToArrayPayload(data), ...convertToArrayPayload(value)];
}
