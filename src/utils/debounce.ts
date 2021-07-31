export default <T extends Function>(callback: T, wait: number) => {
  let timer = 0;
  return (...args: any) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), wait);
  };
};
