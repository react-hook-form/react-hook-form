export default (message: any): void => {
  if (process.env.NODE_ENV !== 'production') console.warn(message);
};
