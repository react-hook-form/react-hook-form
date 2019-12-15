export default (key: string): boolean =>
  !!key.match(/\[.+\]/gi) || key.indexOf('.') > 0;
