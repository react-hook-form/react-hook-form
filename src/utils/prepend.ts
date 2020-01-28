export default (data: any, value?: any) => [
  ...(Array.isArray(value) ? value : [value || null]),
  ...data,
];
