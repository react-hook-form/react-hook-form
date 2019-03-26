export default function getValueAndMessage(
  item,
): {
  value: number | string | RegExp;
  message: string;
} {
  return {
    value: typeof item === 'object' && item.value ? item.value : item,
    message: typeof item === 'object' && item.message ? item.message : true,
  };
}
