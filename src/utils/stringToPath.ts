import compact from './compact';

export default (input: string): string[] =>
  compact(input.replace(/["|']|\]/g, '').split(/\.|\[/));
