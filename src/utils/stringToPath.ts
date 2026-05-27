export default (input: string): string[] =>
  input.split(/[.[\]'"]/g).filter(Boolean);
