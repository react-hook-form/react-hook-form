import '@testing-library/jest-dom';

import { jestPreviewConfigure } from 'jest-preview';
import { TextEncoder } from 'util';

global.TextEncoder = TextEncoder;

// Automatically preview failed tests to Jest Preview Dashboard
// https://www.jest-preview.com/blog/automatic-mode
jestPreviewConfigure({
  autoPreview: true,
});
