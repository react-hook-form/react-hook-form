import { fireEvent } from '@testing-library/react';
import { describe, it } from 'vitest';
import { vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('useFieldArray', () => {
  it('should behaviour correctly without defaultValues', async () => {
    await renderApp('http://localhost:3000/useFieldArray/normal');
    const renderCountStart = getRenderCount();

    const append1 = await (async () => {
      await userEvent.click(document.querySelector('#append')!);
      await vi.waitFor(() => {
        expect(
          Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
            'input',
          )?.value,
        ).toBeTruthy();
      });
      return (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value;
    })();
    expect(document.querySelectorAll('ul > li')).toHaveLength(1);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: append1 }],
    });

    const prepend1 = await (async () => {
      await userEvent.click(document.querySelector('#prepend')!);
      await vi.waitFor(() => {
        expect(
          Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
            'input',
          )?.value,
        ).toBeTruthy();
      });
      return (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value;
    })();
    expect(document.querySelectorAll('ul > li')).toHaveLength(2);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(prepend1);

    const append2 = await (async () => {
      await userEvent.click(document.querySelector('#append')!);
      await vi.waitFor(() => {
        expect(
          Array.from(document.querySelectorAll('ul > li'))[2]?.querySelector(
            'input',
          )?.value,
        ).toBeTruthy();
      });
      return (
        Array.from(document.querySelectorAll('ul > li'))[2]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value;
    })();
    expect(document.querySelectorAll('ul > li')).toHaveLength(3);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[2]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(append2);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: prepend1 }, { name: append1 }, { name: append2 }],
    });

    await userEvent.click(document.querySelector('#swap')!);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(append2);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[2]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(append1);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: prepend1 }, { name: append2 }, { name: append1 }],
    });

    await userEvent.click(document.querySelector('#move')!);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(append1);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(prepend1);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: append1 }, { name: prepend1 }, { name: append2 }],
    });

    const insert1 = await (async () => {
      await userEvent.click(document.querySelector('#insert')!);
      await vi.waitFor(() => {
        expect(
          Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
            'input',
          )?.value,
        ).toBeTruthy();
      });
      return (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value;
    })();
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(insert1);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: append1 },
        { name: insert1 },
        { name: prepend1 },
        { name: append2 },
      ],
    });

    await userEvent.click(document.querySelector('#remove')!);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(append1);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(prepend1);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: append1 }, { name: prepend1 }, { name: append2 }],
    });

    await userEvent.click(document.querySelector('#delete1')!);

    expect(document.querySelectorAll('ul > li')).toHaveLength(2);

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(append1);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(append2);

    await userEvent.click(document.querySelector('#delete1')!);

    expect(document.querySelectorAll('ul > li')).toHaveLength(1);

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(append1);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: append1 }],
    });

    await userEvent.click(document.querySelector('#update')!);

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('changed');

    await userEvent.click(document.querySelector('#removeAll')!);
    expect(document.querySelectorAll('ul > li')).toHaveLength(0);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [],
    });

    const asyncAppend1 = await (async () => {
      await userEvent.click(document.querySelector('#append')!);
      await vi.waitFor(() => {
        expect(
          Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
            'input',
          )?.value,
        ).toBeTruthy();
      });
      return (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value;
    })();
    await userEvent.click(document.querySelector('#append')!);
    await userEvent.click(document.querySelector('#append')!);

    await userEvent.click(document.querySelector('#removeAsync')!);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await userEvent.click(document.querySelector('#removeAsync')!);
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(document.querySelectorAll('input')).toHaveLength(1);

    await userEvent.click(document.querySelector('#submit')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: asyncAppend1 }],
    });

    expectRenderCountDelta(renderCountStart, 41);
  });

  it('should behaviour correctly with defaultValue', async () => {
    await renderApp('http://localhost:3000/useFieldArray/default');
    const renderCountStart = getRenderCount();

    expect(document.querySelectorAll('ul > li')).toHaveLength(3);

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test');

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test1');

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[2]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test2');

    const appendVal = await (async () => {
      await userEvent.click(document.querySelector('#append')!);
      await vi.waitFor(() => {
        expect(
          Array.from(document.querySelectorAll('ul > li'))[3]?.querySelector(
            'input',
          )?.value,
        ).toBeTruthy();
      });
      return (
        Array.from(document.querySelectorAll('ul > li'))[3]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value;
    })();

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: 'test' },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    const prependVal = await (async () => {
      await userEvent.click(document.querySelector('#prepend')!);
      await vi.waitFor(() => {
        expect(
          Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
            'input',
          )?.value,
        ).toBeTruthy();
      });
      return (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value;
    })();
    expect(document.querySelectorAll('ul > li')).toHaveLength(5);

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(prependVal);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: prependVal },
        { name: 'test' },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await userEvent.click(document.querySelector('#swap')!);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test1');
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[2]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test');

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: prependVal },
        { name: 'test1' },
        { name: 'test' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await userEvent.click(document.querySelector('#move')!);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test');
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(prependVal);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: 'test' },
        { name: prependVal },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    const insertVal = await (async () => {
      await userEvent.click(document.querySelector('#insert')!);
      await vi.waitFor(() => {
        expect(
          Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
            'input',
          )?.value,
        ).toBeTruthy();
      });
      return (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value;
    })();
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(insertVal);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: 'test' },
        { name: insertVal },
        { name: prependVal },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await userEvent.click(document.querySelector('#remove')!);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test');
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(prependVal);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: 'test' },
        { name: prependVal },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await userEvent.click(document.querySelector('#delete2')!);

    expect(document.querySelectorAll('ul > li')).toHaveLength(4);

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test');
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(prependVal);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[2]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test2');
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[3]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(appendVal);

    await userEvent.click(document.querySelector('#delete3')!);

    expect(document.querySelectorAll('ul > li')).toHaveLength(3);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: 'test' }, { name: prependVal }, { name: 'test2' }],
    });

    await userEvent.click(document.querySelector('#removeAll')!);
    expect(document.querySelectorAll('ul > li')).toHaveLength(0);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [],
    });

    const finalAppend = await (async () => {
      await userEvent.click(document.querySelector('#append')!);
      await vi.waitFor(() => {
        expect(
          Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
            'input',
          )?.value,
        ).toBeTruthy();
      });
      return (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value;
    })();

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(finalAppend);

    const finalPrepend = await (async () => {
      await userEvent.click(document.querySelector('#prepend')!);
      await vi.waitFor(() => {
        expect(
          Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
            'input',
          )?.value,
        ).toBeTruthy();
      });
      return (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value;
    })();

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(finalPrepend);

    expectRenderCountDelta(renderCountStart, 32);
  });

  it('should behaviour correctly with defaultValue and without auto focus', async () => {
    await renderApp(
      'http://localhost:3000/useFieldArray/defaultAndWithoutFocus',
    );
    const renderCountStart = getRenderCount();

    expect(document.querySelectorAll('ul > li')).toHaveLength(3);

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test');

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test1');

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[2]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test2');

    const appendVal = await (async () => {
      await userEvent.click(document.querySelector('#append')!);
      await vi.waitFor(() => {
        expect(
          Array.from(document.querySelectorAll('ul > li'))[3]?.querySelector(
            'input',
          )?.value,
        ).toBeTruthy();
      });
      return (
        Array.from(document.querySelectorAll('ul > li'))[3]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value;
    })();

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: 'test' },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    const prependVal = await (async () => {
      await userEvent.click(document.querySelector('#prepend')!);
      await vi.waitFor(() => {
        expect(
          Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
            'input',
          )?.value,
        ).toBeTruthy();
      });
      return (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value;
    })();
    expect(document.querySelectorAll('ul > li')).toHaveLength(5);

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(prependVal);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: prependVal },
        { name: 'test' },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await userEvent.click(document.querySelector('#swap')!);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test1');
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[2]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test');

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: prependVal },
        { name: 'test1' },
        { name: 'test' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await userEvent.click(document.querySelector('#move')!);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test');
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(prependVal);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: 'test' },
        { name: prependVal },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    const insertVal = await (async () => {
      await userEvent.click(document.querySelector('#insert')!);
      await vi.waitFor(() => {
        expect(
          Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
            'input',
          )?.value,
        ).toBeTruthy();
      });
      return (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value;
    })();
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(insertVal);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: 'test' },
        { name: insertVal },
        { name: prependVal },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await userEvent.click(document.querySelector('#remove')!);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test');
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(prependVal);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: 'test' },
        { name: prependVal },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await userEvent.click(document.querySelector('#delete2')!);

    expect(document.querySelectorAll('ul > li')).toHaveLength(4);

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test');
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(prependVal);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[2]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('test2');
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[3]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(appendVal);

    await userEvent.click(document.querySelector('#delete3')!);

    expect(document.querySelectorAll('ul > li')).toHaveLength(3);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: 'test' }, { name: prependVal }, { name: 'test2' }],
    });

    await userEvent.click(document.querySelector('#removeAll')!);
    expect(document.querySelectorAll('ul > li')).toHaveLength(0);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: [],
    });

    const finalAppend = await (async () => {
      await userEvent.click(document.querySelector('#append')!);
      await vi.waitFor(() => {
        expect(
          Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
            'input',
          )?.value,
        ).toBeTruthy();
      });
      return (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value;
    })();

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(finalAppend);

    const finalPrepend = await (async () => {
      await userEvent.click(document.querySelector('#prepend')!);
      await vi.waitFor(() => {
        expect(
          Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
            'input',
          )?.value,
        ).toBeTruthy();
      });
      return (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value;
    })();

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(finalPrepend);

    expectRenderCountDelta(renderCountStart, 28);
  });

  it('should replace fields with new values', async () => {
    await renderApp('http://localhost:3000/useFieldArray/normal');
    const renderCountStart = getRenderCount();
    await userEvent.click(document.querySelector('#replace')!);
    const replaceValues = Array.from(document.querySelectorAll('ul > li')).map(
      (li) => (li.querySelector('input') as HTMLInputElement).value,
    );
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(replaceValues[0]);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[1]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(replaceValues[1]);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[2]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(replaceValues[2]);
    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[3]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe(replaceValues[3]);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: replaceValues.map((name) => ({ name })),
    });
  });

  it('should display the correct dirty value with default value', async () => {
    await renderApp('http://localhost:3000/useFieldArray/default');
    const renderCountStart = getRenderCount();
    expect(document.querySelector('#dirty')!.textContent).toContain('no');
    await userEvent.click(document.querySelector('#update')!);
    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: true }, null, null],
    });
    expect(document.querySelector('#dirty')!.textContent).toContain('yes');
    await userEvent.click(document.querySelector('#updateRevert')!);
    expect(document.querySelector('#dirty')!.textContent).toContain('no');
    await userEvent.click(document.querySelector('#append')!);
    await (async () => {
      const el = document.querySelector('#field1')! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await userEvent.click(document.querySelector('#prepend')!);
    await userEvent.click(document.querySelector('#delete2')!);
    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: true }, { name: true }, null, { name: true }],
    });
    await userEvent.click(document.querySelector('#delete2')!);
    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: true }, { name: true }, { name: true }],
    });
    await userEvent.click(document.querySelector('#delete1')!);
    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: true }, { name: true }, { name: true }],
    });
    await userEvent.click(document.querySelector('#delete1')!);
    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: true }, { name: true }, { name: true }],
    });
    await userEvent.click(document.querySelector('#delete0')!);
    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: true }, { name: true }, { name: true }],
    });
    expect(document.querySelector('#dirty')!.textContent).toContain('yes');
    expectRenderCountDelta(renderCountStart, 14);
  });

  it('should display the correct dirty value without default value', async () => {
    await renderApp('http://localhost:3000/useFieldArray/normal');
    const renderCountStart = getRenderCount();
    expect(document.querySelector('#dirty')!.textContent).toContain('no');
    await userEvent.click(document.querySelector('#append')!);
    expect(document.querySelector('#dirty')!.textContent).toContain('yes');
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: true }],
    });
    expect(document.querySelector('#dirty')!.textContent).toContain('yes');
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    expect(document.querySelector('#dirty')!.textContent).toContain('yes');
    await userEvent.click(document.querySelector('#prepend')!);
    await userEvent.click(document.querySelector('#prepend')!);
    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: true }, { name: true }, { name: true }],
    });
    await userEvent.click(document.querySelector('#delete0')!);
    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: true }, { name: true }],
    });

    await userEvent.click(document.querySelector('#delete1')!);
    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: true }],
    });

    await userEvent.click(document.querySelector('#delete0')!);
    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({});

    expect(document.querySelector('#dirty')!.textContent).toContain('yes');
  });

  it('should display the correct dirty value with default value', async () => {
    await renderApp('http://localhost:3000/useFieldArray/default');
    const renderCountStart = getRenderCount();
    expect(document.querySelector('#dirty')!.textContent).toContain('no');
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    expect(document.querySelector('#dirty')!.textContent).toContain('no');
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    expect(document.querySelector('#dirty')!.textContent).toContain('yes');
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    expect(document.querySelector('#dirty')!.textContent).toContain('yes');
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    expect(document.querySelector('#dirty')!.textContent).toContain('yes');
    await userEvent.clear(document.querySelector('#field0')!);
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    expect(document.querySelector('#dirty')!.textContent).toContain('no');
    await userEvent.click(document.querySelector('#delete1')!);
    expect(document.querySelector('#dirty')!.textContent).toContain('yes');
    await userEvent.click(document.querySelector('#append')!);
    await userEvent.clear(document.querySelector('#field0')!);
    await userEvent.type(document.querySelector('#field0')!, 'test');
    await userEvent.clear(document.querySelector('#field1')!);
    await userEvent.type(document.querySelector('#field1')!, 'test1');
    await userEvent.clear(document.querySelector('#field2')!);
    await userEvent.type(document.querySelector('#field2')!, 'test2');
    expect(document.querySelector('#dirty')!.textContent).toContain('no');
  });

  it('should display the correct dirty value with async default value', async () => {
    await renderApp('http://localhost:3000/useFieldArray/asyncReset');
    const renderCountStart = getRenderCount();
    await vi.waitFor(() =>
      expect(document.querySelector('#field0')).not.toBeNull(),
    );
    expect(document.querySelector('#dirty')!.textContent).toContain('no');
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    expect(document.querySelector('#dirty')!.textContent).toContain('no');
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    expect(document.querySelector('#dirty')!.textContent).toContain('yes');
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    expect(document.querySelector('#dirty')!.textContent).toContain('yes');
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    expect(document.querySelector('#dirty')!.textContent).toContain('yes');
    await userEvent.clear(document.querySelector('#field0')!);
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    expect(document.querySelector('#dirty')!.textContent).toContain('no');
    await userEvent.click(document.querySelector('#delete1')!);
    expect(document.querySelector('#dirty')!.textContent).toContain('yes');
    await userEvent.click(document.querySelector('#append')!);
    await userEvent.clear(document.querySelector('#field0')!);
    await userEvent.type(document.querySelector('#field0')!, 'test');
    await userEvent.clear(document.querySelector('#field1')!);
    await userEvent.type(document.querySelector('#field1')!, 'test1');
    await userEvent.clear(document.querySelector('#field2')!);
    await userEvent.type(document.querySelector('#field2')!, 'test2');
    expect(document.querySelector('#dirty')!.textContent).toContain('no');
  });

  it('should display correct error with the inputs', async () => {
    await renderApp('http://localhost:3000/useFieldArray/default');
    const renderCountStart = getRenderCount();
    await userEvent.click(document.querySelector('#prepend')!);
    await userEvent.clear(document.querySelector('#field1')!);
    await userEvent.clear(document.querySelector('#field2')!);
    await userEvent.clear(document.querySelector('#field3')!);
    await userEvent.click(document.querySelector('#append')!);
    await userEvent.click(document.querySelector('#submit')!);
    expect(document.querySelector('#error1')!.textContent).toContain(
      'This is required',
    );
    expect(document.querySelector('#error2')!.textContent).toContain(
      'This is required',
    );
    expect(document.querySelector('#error3')!.textContent).toContain(
      'This is required',
    );
    await (async () => {
      const el = document.querySelector('#field1')! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    expect(document.querySelector('#error1')).toBeNull();
    expect(document.querySelector('#error2')!.textContent).toContain(
      'This is required',
    );
    expect(document.querySelector('#error3')!.textContent).toContain(
      'This is required',
    );
    await userEvent.click(document.querySelector('#move')!);
    expect(document.querySelector('#error0')!.textContent).toContain(
      'This is required',
    );
    expect(document.querySelector('#error2')).toBeNull();
    await userEvent.click(document.querySelector('#prepend')!);
    expect(document.querySelector('#error0')).toBeNull();
    expect(document.querySelector('#error1')!.textContent).toContain(
      'This is required',
    );
  });

  it('should return correct touched values', async () => {
    await renderApp('http://localhost:3000/useFieldArray/default');
    const renderCountStart = getRenderCount();
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '1');
      else await userEvent.type(el, '1');
    })();
    await (async () => {
      const el = document.querySelector('#field1')! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '1');
      else await userEvent.type(el, '1');
    })();
    await (async () => {
      const el = document.querySelector('#field2')! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '1');
      else await userEvent.type(el, '1');
    })();
    expect(document.querySelector('#touched')!.textContent).toContain(
      '[{"name":true},{"name":true}]',
    );
    await userEvent.click(document.querySelector('#append')!);
    await userEvent.click(document.querySelector('#prepend')!);
    expect(document.querySelector('#touched')!.textContent).toContain(
      '[null,{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
    await userEvent.click(document.querySelector('#insert')!);
    expect(document.querySelector('#touched')!.textContent).toContain(
      '[{"name":true},null,{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
    await userEvent.click(document.querySelector('#swap')!);
    expect(document.querySelector('#touched')!.textContent).toContain(
      '[{"name":true},{"name":true},{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
    await userEvent.click(document.querySelector('#move')!);
    expect(document.querySelector('#touched')!.textContent).toContain(
      '[{"name":true},{"name":true},{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
    await userEvent.click(document.querySelector('#insert')!);
    expect(document.querySelector('#touched')!.textContent).toContain(
      '[{"name":true},null,{"name":true},{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
    await userEvent.click(document.querySelector('#delete4')!);
    expect(document.querySelector('#touched')!.textContent).toContain(
      '[{"name":true},{"name":true},{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
  });

  it('should return correct touched values without autoFocus', async () => {
    await renderApp(
      'http://localhost:3000/useFieldArray/defaultAndWithoutFocus',
    );
    const renderCountStart = getRenderCount();
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '1');
      else await userEvent.type(el, '1');
    })();
    await (async () => {
      const el = document.querySelector('#field1')! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '1');
      else await userEvent.type(el, '1');
    })();
    await (async () => {
      const el = document.querySelector('#field2')! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '1');
      else await userEvent.type(el, '1');
    })();
    expect(document.querySelector('#touched')!.textContent).toContain(
      '[{"name":true},{"name":true}]',
    );
    await userEvent.click(document.querySelector('#append')!);
    await userEvent.click(document.querySelector('#prepend')!);
    expect(document.querySelector('#touched')!.textContent).toContain(
      '[null,{"name":true},{"name":true},{"name":true},null]',
    );
    await userEvent.click(document.querySelector('#insert')!);
    expect(document.querySelector('#touched')!.textContent).toContain(
      '[null,null,{"name":true},{"name":true},{"name":true},null]',
    );
    await userEvent.click(document.querySelector('#swap')!);
    expect(document.querySelector('#touched')!.textContent).toContain(
      '[null,{"name":true},null,{"name":true},{"name":true},null]',
    );
    await userEvent.click(document.querySelector('#move')!);
    expect(document.querySelector('#touched')!.textContent).toContain(
      '[null,null,{"name":true},{"name":true},{"name":true},null]',
    );
    await userEvent.click(document.querySelector('#insert')!);
    expect(document.querySelector('#touched')!.textContent).toContain(
      '[null,null,null,{"name":true},{"name":true},{"name":true},null]',
    );
    await userEvent.click(document.querySelector('#delete4')!);
    expect(document.querySelector('#touched')!.textContent).toContain(
      '[null,null,null,{"name":true},{"name":true},null]',
    );
  });

  it('should return correct isValid formState', async () => {
    await renderApp('http://localhost:3000/useFieldArray/formState');
    const renderCountStart = getRenderCount();
    await vi.waitFor(() =>
      expect(document.querySelector('#isValid')!.textContent).toContain('yes'),
    );
    await userEvent.click(document.querySelector('#append')!);
    await userEvent.click(document.querySelector('#append')!);
    await userEvent.click(document.querySelector('#append')!);

    expect(document.querySelector('#isValid')!.textContent).toContain('yes');

    await userEvent.clear(document.querySelector('#field0')!);

    expect(document.querySelector('#isValid')!.textContent).toContain('no');

    await userEvent.click(document.querySelector('#delete0')!);
    await (async () => {
      const el = document.querySelector('#field1')! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '1');
      else await userEvent.type(el, '1');
    })();

    expect(document.querySelector('#isValid')!.textContent).toContain('yes');

    await userEvent.clear(document.querySelector('#field0')!);

    expect(document.querySelector('#isValid')!.textContent).toContain('no');

    // introduced by react 19 with race condition with blur and useEffect action
    await (async () => {
      const el = document.querySelector('#field0')! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    await new Promise((resolve) => setTimeout(resolve, 100));

    await userEvent.click(document.querySelector('#delete0')!);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const emptyField = document.querySelector(
      'ul > li input[id^="field"]',
    ) as HTMLInputElement | null;

    if (emptyField && !emptyField.value) {
      await (async () => {
        const el = document.querySelector(
          `#${emptyField.id}`,
        )! as HTMLInputElement;
        if (el.type === 'date') await userEvent.fill(el, '1');
        else await userEvent.type(el, '1');
      })();
    }

    await vi.waitFor(() =>
      expect(document.querySelector('#isValid')!.textContent).toContain('yes'),
    );

    await userEvent.click(document.querySelector('#append')!);
    await userEvent.clear(document.querySelector('#field0')!);

    expect(document.querySelector('#isValid')!.textContent).toContain('no');

    await userEvent.click(document.querySelector('#delete0')!);

    await vi.waitFor(() =>
      expect(document.querySelector('#isValid')!.textContent).toContain('yes'),
    );

    await userEvent.click(document.querySelector('#append')!);
    await userEvent.click(document.querySelector('#append')!);

    await userEvent.clear(document.querySelector('#field1')!);
    await userEvent.clear(document.querySelector('#field2')!);

    expect(document.querySelector('#isValid')!.textContent).toContain('no');

    await userEvent.click(document.querySelector('#delete1')!);
    await userEvent.click(document.querySelector('#delete1')!);

    await vi.waitFor(() =>
      expect(document.querySelector('#isValid')!.textContent).toContain('yes'),
    );
  });
});
