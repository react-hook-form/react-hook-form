import generateId from './generateId';

describe('generateId', () => {
  it('should generate a unique id', () => {
    expect(/\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}/i.test(generateId())).toBeTruthy();
  });

  it('should fallback to current date if performance is undefined', () => {
    const { performance } = window;
    delete (window as any).performance;
    expect(/\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}/i.test(generateId())).toBeTruthy();
    (window as any).performance = performance;
  });
});
