export default (data: any, index: number, value?: any) => [
  ...data.slice(0, index),
  value || null,
  ...data.slice(index),
];
