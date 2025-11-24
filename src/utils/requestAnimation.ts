export const raf =
  typeof window !== 'undefined' &&
  typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (cb: FrameRequestCallback) => setTimeout(cb, 0);
