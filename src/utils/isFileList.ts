export default (value: unknown): value is FileList =>
  typeof FileList !== 'undefined' && value instanceof FileList;
