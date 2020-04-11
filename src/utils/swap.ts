export default <T>(data: T[], indexA: number, indexB: number): void => {
  const temp = [data[indexB], data[indexA]];
  data[indexA] = temp[0];
  data[indexB] = temp[1];
};
