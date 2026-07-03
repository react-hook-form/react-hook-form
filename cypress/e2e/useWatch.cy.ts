import { userEvent } from 'vitest/browser';

import { renderApp } from '../support/renderApp';

describe('useWatch', () => {
  it('should only trigger render when interact with input 1', async () => {
    await renderApp('http://localhost:3000/useWatch');
    const parentStart = Number.parseInt(
      (document.querySelector('#parentCounter')!.textContent ?? '').match(
        /(\d+)/,
      )?.[1] ?? '0',
      10,
    );
    const childStart = Number.parseInt(
      (document.querySelector('#childCounter')!.textContent ?? '').match(
        /(\d+)/,
      )?.[1] ?? '0',
      10,
    );
    const grandChildStart = Number.parseInt(
      (document.querySelector('#grandChildCounter')!.textContent ?? '').match(
        /(\d+)/,
      )?.[1] ?? '0',
      10,
    );
    const grandChild1Start = Number.parseInt(
      (document.querySelector('#grandChild1Counter')!.textContent ?? '').match(
        /(\d+)/,
      )?.[1] ?? '0',
      10,
    );
    const grandChild2Start = Number.parseInt(
      (document.querySelector('#grandChild2Counter')!.textContent ?? '').match(
        /(\d+)/,
      )?.[1] ?? '0',
      10,
    );

    await (async () => {
      const el = document.querySelector(
        'input[name="test"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 't');
      else await userEvent.type(el, 't');
    })();

    {
      const actual =
        Number.parseInt(
          (document.querySelector('#parentCounter')!.textContent ?? '').match(
            /(\d+)/,
          )?.[1] ?? '0',
          10,
        ) - parentStart;
      expect(actual).toBeGreaterThanOrEqual(1 - 2);
      expect(actual).toBeLessThanOrEqual(1 + 2);
    }
    {
      const actual =
        Number.parseInt(
          (document.querySelector('#childCounter')!.textContent ?? '').match(
            /(\d+)/,
          )?.[1] ?? '0',
          10,
        ) - childStart;
      expect(actual).toBeGreaterThanOrEqual(1 - 2);
      expect(actual).toBeLessThanOrEqual(1 + 2);
    }
    {
      const actual =
        Number.parseInt(
          (
            document.querySelector('#grandChildCounter')!.textContent ?? ''
          ).match(/(\d+)/)?.[1] ?? '0',
          10,
        ) - grandChildStart;
      expect(actual).toBeGreaterThanOrEqual(1 - 2);
      expect(actual).toBeLessThanOrEqual(1 + 2);
    }
    {
      const actual =
        Number.parseInt(
          (
            document.querySelector('#grandChild1Counter')!.textContent ?? ''
          ).match(/(\d+)/)?.[1] ?? '0',
          10,
        ) - grandChild1Start;
      expect(actual).toBeGreaterThanOrEqual(1 - 2);
      expect(actual).toBeLessThanOrEqual(1 + 2);
    }
    {
      const actual =
        Number.parseInt(
          (
            document.querySelector('#grandChild2Counter')!.textContent ?? ''
          ).match(/(\d+)/)?.[1] ?? '0',
          10,
        ) - grandChild2Start;
      expect(actual).toBeGreaterThanOrEqual(1 - 2);
      expect(actual).toBeLessThanOrEqual(1 + 2);
    }
    expect(document.querySelector('#grandchild01')!.textContent).toContain('t');
    expect(document.querySelector('#grandchild00')!.textContent).toContain('t');

    await (async () => {
      const el = document.querySelector(
        'input[name="test"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'h');
      else await userEvent.type(el, 'h');
    })();
    expect(document.querySelector('#grandchild00')!.textContent).toContain(
      'th',
    );
    expect(document.querySelector('#grandchild01')!.textContent).toContain(
      'th',
    );
    expect(document.querySelector('#grandchild2')!.textContent).toContain('t');
  });

  it('should only trigger render when interact with input 2', async () => {
    await renderApp('http://localhost:3000/useWatch');
    const parentStart = Number.parseInt(
      (document.querySelector('#parentCounter')!.textContent ?? '').match(
        /(\d+)/,
      )?.[1] ?? '0',
      10,
    );
    const childStart = Number.parseInt(
      (document.querySelector('#childCounter')!.textContent ?? '').match(
        /(\d+)/,
      )?.[1] ?? '0',
      10,
    );
    const grandChildStart = Number.parseInt(
      (document.querySelector('#grandChildCounter')!.textContent ?? '').match(
        /(\d+)/,
      )?.[1] ?? '0',
      10,
    );
    const grandChild1Start = Number.parseInt(
      (document.querySelector('#grandChild1Counter')!.textContent ?? '').match(
        /(\d+)/,
      )?.[1] ?? '0',
      10,
    );
    const grandChild2Start = Number.parseInt(
      (document.querySelector('#grandChild2Counter')!.textContent ?? '').match(
        /(\d+)/,
      )?.[1] ?? '0',
      10,
    );

    await (async () => {
      const el = document.querySelector(
        'input[name="test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'h');
      else await userEvent.type(el, 'h');
    })();

    {
      const actual =
        Number.parseInt(
          (document.querySelector('#parentCounter')!.textContent ?? '').match(
            /(\d+)/,
          )?.[1] ?? '0',
          10,
        ) - parentStart;
      expect(actual).toBeGreaterThanOrEqual(1 - 2);
      expect(actual).toBeLessThanOrEqual(1 + 2);
    }
    {
      const actual =
        Number.parseInt(
          (document.querySelector('#childCounter')!.textContent ?? '').match(
            /(\d+)/,
          )?.[1] ?? '0',
          10,
        ) - childStart;
      expect(actual).toBeGreaterThanOrEqual(1 - 2);
      expect(actual).toBeLessThanOrEqual(1 + 2);
    }
    {
      const actual =
        Number.parseInt(
          (
            document.querySelector('#grandChildCounter')!.textContent ?? ''
          ).match(/(\d+)/)?.[1] ?? '0',
          10,
        ) - grandChildStart;
      expect(actual).toBeGreaterThanOrEqual(1 - 2);
      expect(actual).toBeLessThanOrEqual(1 + 2);
    }
    {
      const actual =
        Number.parseInt(
          (
            document.querySelector('#grandChild1Counter')!.textContent ?? ''
          ).match(/(\d+)/)?.[1] ?? '0',
          10,
        ) - grandChild1Start;
      expect(actual).toBeGreaterThanOrEqual(1 - 2);
      expect(actual).toBeLessThanOrEqual(1 + 2);
    }
    {
      const actual =
        Number.parseInt(
          (
            document.querySelector('#grandChild2Counter')!.textContent ?? ''
          ).match(/(\d+)/)?.[1] ?? '0',
          10,
        ) - grandChild2Start;
      expect(actual).toBeGreaterThanOrEqual(1 - 2);
      expect(actual).toBeLessThanOrEqual(1 + 2);
    }

    await (async () => {
      const el = document.querySelector(
        'input[name="test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'h');
      else await userEvent.type(el, 'h');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="test"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'h');
      else await userEvent.type(el, 'h');
    })();
    expect(document.querySelector('#grandchild00')!.textContent).toContain('h');
    expect(document.querySelector('#grandchild01')!.textContent).toContain('h');
    expect(document.querySelector('#grandchild1')!.textContent).toContain('hh');
    expect(document.querySelector('#grandchild2')!.textContent).toContain(
      'hhh',
    );
  });

  it('should only trigger render when interact with input 3', async () => {
    await renderApp('http://localhost:3000/useWatch');
    const parentStart = Number.parseInt(
      (document.querySelector('#parentCounter')!.textContent ?? '').match(
        /(\d+)/,
      )?.[1] ?? '0',
      10,
    );
    const childStart = Number.parseInt(
      (document.querySelector('#childCounter')!.textContent ?? '').match(
        /(\d+)/,
      )?.[1] ?? '0',
      10,
    );
    const grandChildStart = Number.parseInt(
      (document.querySelector('#grandChildCounter')!.textContent ?? '').match(
        /(\d+)/,
      )?.[1] ?? '0',
      10,
    );
    const grandChild1Start = Number.parseInt(
      (document.querySelector('#grandChild1Counter')!.textContent ?? '').match(
        /(\d+)/,
      )?.[1] ?? '0',
      10,
    );
    const grandChild2Start = Number.parseInt(
      (document.querySelector('#grandChild2Counter')!.textContent ?? '').match(
        /(\d+)/,
      )?.[1] ?? '0',
      10,
    );

    await (async () => {
      const el = document.querySelector(
        'input[name="test2"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'e');
      else await userEvent.type(el, 'e');
    })();

    {
      const actual =
        Number.parseInt(
          (document.querySelector('#parentCounter')!.textContent ?? '').match(
            /(\d+)/,
          )?.[1] ?? '0',
          10,
        ) - parentStart;
      expect(actual).toBeGreaterThanOrEqual(1 - 2);
      expect(actual).toBeLessThanOrEqual(1 + 2);
    }
    {
      const actual =
        Number.parseInt(
          (document.querySelector('#childCounter')!.textContent ?? '').match(
            /(\d+)/,
          )?.[1] ?? '0',
          10,
        ) - childStart;
      expect(actual).toBeGreaterThanOrEqual(1 - 2);
      expect(actual).toBeLessThanOrEqual(1 + 2);
    }
    {
      const actual =
        Number.parseInt(
          (
            document.querySelector('#grandChildCounter')!.textContent ?? ''
          ).match(/(\d+)/)?.[1] ?? '0',
          10,
        ) - grandChildStart;
      expect(actual).toBeGreaterThanOrEqual(1 - 2);
      expect(actual).toBeLessThanOrEqual(1 + 2);
    }
    {
      const actual =
        Number.parseInt(
          (
            document.querySelector('#grandChild1Counter')!.textContent ?? ''
          ).match(/(\d+)/)?.[1] ?? '0',
          10,
        ) - grandChild1Start;
      expect(actual).toBeGreaterThanOrEqual(1 - 2);
      expect(actual).toBeLessThanOrEqual(1 + 2);
    }
    {
      const actual =
        Number.parseInt(
          (
            document.querySelector('#grandChild2Counter')!.textContent ?? ''
          ).match(/(\d+)/)?.[1] ?? '0',
          10,
        ) - grandChild2Start;
      expect(actual).toBeGreaterThanOrEqual(1 - 2);
      expect(actual).toBeLessThanOrEqual(1 + 2);
    }

    await (async () => {
      const el = document.querySelector(
        'input[name="test2"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'eh');
      else await userEvent.type(el, 'eh');
    })();

    await (async () => {
      const el = document.querySelector(
        'input[name="test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'eh');
      else await userEvent.type(el, 'eh');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="test"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'eh');
      else await userEvent.type(el, 'eh');
    })();
    expect(document.querySelector('#grandchild00')!.textContent).toContain(
      'eh',
    );
    expect(document.querySelector('#grandchild01')!.textContent).toContain(
      'eh',
    );
    expect(document.querySelector('#grandchild1')!.textContent).toContain('eh');
    expect(document.querySelector('#grandchild2')!.textContent).toContain(
      'eheheeh',
    );
  });
});
