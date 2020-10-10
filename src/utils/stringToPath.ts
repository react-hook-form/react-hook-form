import filterOutFalsy from './filterOutFalsy';

export default (input: string): string[] =>
  filterOutFalsy(
    input
      .replace(/["|']/g, '')
      .replace(/\[/g, '.')
      .replace(/\]/g, '')
      .split('.'),
  );
