export default (name: string, searchName: string) =>
  name.startsWith(`${searchName}[`);
