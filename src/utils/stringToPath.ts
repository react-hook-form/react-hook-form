import compact from './compact';

export default (input: string): string[] =>
  compact(
    input
      .replace(/["']/g, '')
      .split(/(?=\[)|\]/g)
      .map((x) => (x.startsWith('[') ? x.slice(1) : x.split('.')))
      .flat(),
  );
