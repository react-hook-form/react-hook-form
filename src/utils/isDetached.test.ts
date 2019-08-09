import isDetached from './isDetached';

describe('isDetached', () => {
  it('should return false when the node is still in the main document', () => {
    document.body.innerHTML = ''; // Make sure the body is empty
    const node = document.createElement('div');
    document.body.appendChild(node);

    expect(isDetached(node)).toBeFalsy();
  });

  it('should return true when the node was never attached to the main document', () => {
    document.body.innerHTML = ''; // Make sure the body is empty
    const node = document.createElement('div');

    expect(isDetached(node)).toBeTruthy();
  });

  it('should return false when the given element is not an HTMLElement', () => {
    expect(isDetached({ name: 'myComp' })).toBeFalsy();
    expect(isDetached('myComp')).toBeFalsy();
    expect(isDetached(20)).toBeFalsy();
  });

  it('should return true when the given element undefined or otherwise falsy', () => {
    expect(isDetached(undefined)).toBeTruthy();
    expect(isDetached(null)).toBeTruthy();
    expect(isDetached('')).toBeTruthy();
    expect(isDetached(0)).toBeTruthy();
    expect(isDetached(NaN)).toBeTruthy();
    expect(isDetached(false)).toBeTruthy();
  });

  it('should return true when the node is no longer in the main document', () => {
    document.body.innerHTML = ''; // Make sure the body is empty
    const node = document.createElement('div');
    document.body.appendChild(node);
    expect(isDetached(node)).toBeFalsy();
    document.body.removeChild(node);
    expect(isDetached(node)).toBeTruthy();
  });

  it('should return false when the node is nested deep in the main document', () => {
    document.body.innerHTML = ''; // Make sure the body is empty

    let lastNode = document.body;
    for (var i = 0; i < 10; ++i) {
      const newNode = document.createElement('div');
      lastNode.appendChild(newNode);
      lastNode = newNode;
    }

    expect(isDetached(lastNode)).toBeFalsy();
  });

  it('should return false when the node is an attached iframe', () => {
    document.body.innerHTML = ''; // Make sure the body is empty
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    expect(isDetached(iframe)).toBeFalsy();
  });

  it('should return true when the node is a detached iframe', () => {
    document.body.innerHTML = ''; // Make sure the body is empty
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    expect(isDetached(iframe)).toBeFalsy();
    document.body.removeChild(iframe);
    expect(isDetached(iframe)).toBeTruthy();
  });

  it('should return false when the node is nested inside an iframe', () => {
    return new Promise((resolve, reject) => {
      document.body.innerHTML = ''; // Make sure the body is empty

      const iframe = document.createElement('iframe');
      iframe.src = 'about:blank';
      iframe.addEventListener(
        'load',
        function() {
          var node = document.createElement('div');
          if (iframe.contentDocument) {
            iframe.contentDocument.body.appendChild(node);

            resolve(isDetached(node));
          } else {
            reject('Could not find iframe contentDocument');
          }
        },
        false,
      );

      document.body.appendChild(iframe);
    }).then(detached => expect(detached).toBeFalsy());
  });

  it('should return true when the node is nested inside an iframe and the iframe is detached', () => {
    return new Promise((resolve, reject) => {
      document.body.innerHTML = ''; // Make sure the body is empty

      const iframe = document.createElement('iframe');
      iframe.src = 'about:blank';
      iframe.addEventListener(
        'load',
        function() {
          var node = document.createElement('div');
          if (iframe.contentDocument) {
            iframe.contentDocument.body.appendChild(node);

            expect(isDetached(node)).toBeFalsy();

            // Now detach the iframe
            document.body.removeChild(iframe);

            resolve(isDetached(node));
          } else {
            reject('Could not find iframe contentDocument');
          }
        },
        false,
      );

      document.body.appendChild(iframe);
    }).then(detached => expect(detached).toBeTruthy());
  });
});
