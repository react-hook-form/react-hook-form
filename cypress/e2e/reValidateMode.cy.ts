import { fireEvent } from '@testing-library/react';
import { describe, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('re-validate mode', () => {
  it('should re-validate the form only onSubmit with mode onSubmit and reValidateMode onSubmit', async () => {
    await renderApp('http://localhost:3000/re-validate-mode/onSubmit/onSubmit');
    const renderCountStart = getRenderCount();
    await userEvent.click(document.querySelector('button#submit')!);

    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }

    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo123456');
      else await userEvent.type(el, 'luo123456');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo12');
      else await userEvent.type(el, 'luo12');
    })();

    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }

    await userEvent.click(document.querySelector('button#submit')!);

    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
    expectRenderCountDelta(renderCountStart, 3);
  });

  it('should re-validate the form only onBlur with mode onSubmit and reValidateMode onBlur', async () => {
    await renderApp('http://localhost:3000/re-validate-mode/onSubmit/onBlur');
    const renderCountStart = getRenderCount();
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();

    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);

    await userEvent.click(document.querySelector('button#submit')!);

    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }

    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo123456');
      else await userEvent.type(el, 'luo123456');
    })();
    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo12');
      else await userEvent.type(el, 'luo12');
    })();
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();

    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
    expectRenderCountDelta(renderCountStart, 4);
  });

  it('should re-validate the form only onSubmit with mode onBlur and reValidateMode onSubmit', async () => {
    await renderApp('http://localhost:3000/re-validate-mode/onBlur/onSubmit');
    const renderCountStart = getRenderCount();
    await userEvent.click(document.querySelector('button#submit')!);

    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }

    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo123456');
      else await userEvent.type(el, 'luo123456');
    })();
    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo12');
      else await userEvent.type(el, 'luo12');
    })();
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();

    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }

    await userEvent.click(document.querySelector('button#submit')!);

    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
    expectRenderCountDelta(renderCountStart, 3);
  });

  it('should re-validate the form only onSubmit with mode onChange and reValidateMode onSubmit', async () => {
    await renderApp('http://localhost:3000/re-validate-mode/onChange/onSubmit');
    const renderCountStart = getRenderCount();
    await userEvent.click(document.querySelector('button#submit')!);

    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }

    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo123456');
      else await userEvent.type(el, 'luo123456');
    })();
    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo12');
      else await userEvent.type(el, 'luo12');
    })();
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }

    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }

    await userEvent.click(document.querySelector('button#submit')!);

    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
    expectRenderCountDelta(renderCountStart, 3);
  });

  it('should re-validate the form onBlur only with mode onBlur and reValidateMode onBlur', async () => {
    await renderApp('http://localhost:3000/re-validate-mode/onBlur/onBlur');
    const renderCountStart = getRenderCount();
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }

    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo123456');
      else await userEvent.type(el, 'luo123456');
    })();
    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo12');
      else await userEvent.type(el, 'luo12');
    })();
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();

    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
    expectRenderCountDelta(renderCountStart, 5);
  });

  it('should re-validate the form onChange with mode onBlur and reValidateMode onChange', async () => {
    await renderApp('http://localhost:3000/re-validate-mode/onBlur/onChange');
    const renderCountStart = getRenderCount();
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }

    await userEvent.clear(document.querySelector('input[name="firstName"]')!);
    await userEvent.clear(document.querySelector('input[name="lastName"]')!);

    await userEvent.click(document.querySelector('button#submit')!);

    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo123456');
      else await userEvent.type(el, 'luo123456');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo12');
      else await userEvent.type(el, 'luo12');
    })();

    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
    expectRenderCountDelta(renderCountStart, 6);
  });
});
