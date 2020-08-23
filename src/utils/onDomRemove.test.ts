import onDomRemove from './onDomRemove';
import isDetached from './isDetached';

jest.mock('./isDetached');

describe('onDomRemove', () => {
  beforeEach(() => {
    (isDetached as any).mockReturnValue(true);
  });

  it('should call the observer', () => {
    // @ts-ignore
    window.MutationObserver = class {
      observe = jest.fn();
    };
    // @ts-ignore
    const observer = onDomRemove({ current: {} }, () => {});
    expect(observer.observe).toBeCalledWith(window.document, {
      childList: true,
      subtree: true,
    });
  });

  it('should not call observer.disconnect if isDetached is false', () => {
    (isDetached as any).mockReturnValue(false);
    let mockCallback: () => void;
    // @ts-ignore
    window.MutationObserver = class {
      constructor(callback: any) {
        mockCallback = callback;
      }
      disconnect = jest.fn();
      observe = jest.fn();
    };

    const mockOnDetachCallback = jest.fn();

    // @ts-ignore
    const observer = onDomRemove({ current: {} }, mockOnDetachCallback);

    // @ts-ignore
    mockCallback();

    expect(observer.observe).toBeCalledWith(window.document, {
      childList: true,
      subtree: true,
    });
    expect(observer.disconnect).not.toBeCalled();
    expect(mockOnDetachCallback).not.toBeCalled();
  });
});
