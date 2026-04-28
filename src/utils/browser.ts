export const isIOS = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent;

  const isiOS = /iPhone|iPad|iPod/i.test(ua);
  return isiOS;
};

export const isSafari = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent;

  const isSafari =
    /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);

  return isSafari;
};

export const isIOSSafari = () => {
  return isSafari() && isIOS();
};
