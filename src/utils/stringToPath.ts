import uniq from './uniq';

export default (input: string): string[] =>
  uniq(
    input
      .replace(/["|']/g, '')
      .replace(/\[/g, '.')
      .replace(/\]/g, '')
      .split('.'),
  );
