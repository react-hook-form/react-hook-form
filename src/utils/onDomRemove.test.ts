import onDomRemove from './onDomRemove';

describe('onDomRemove', () => {
  it.only('should call the observer', () => {
    // @ts-ignore
    window.MutationObserver = class {
      // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
      observe = jest.fn();
    };
    const observer = onDomRemove({}, () => {});
    expect(observer.observe).toBeCalledWith(window.document, {
      childList: true,
      subtree: true,
    });
  });
});
