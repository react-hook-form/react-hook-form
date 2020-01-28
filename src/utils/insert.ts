export default (data: any, index: number, value?: any) => [
  ...data.slice(0, index),
  ...(Array.isArray(value) ? value : [value || null]),
  ...data.slice(index),
];
