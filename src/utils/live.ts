import { Ref } from '../types';

import isHTMLElement from './isHTMLElement';

export default (ref: Ref) => !isHTMLElement(ref) || !document.contains(ref);
