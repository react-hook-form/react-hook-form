export default <T>(data: T[], indexA: number, indexB: number) => {
  [data[indexA], data[indexB]] = [data[indexB], data[indexA]];
};
