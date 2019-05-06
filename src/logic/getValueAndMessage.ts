export default (
  item,
): {
  value: number | string | RegExp;
  message: string;
} => ({
  value: typeof item === 'object' && item.value ? item.value : item,
  message: typeof item === 'object' && item.message ? item.message : '',
});
