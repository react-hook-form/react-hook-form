import { vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { renderApp } from '../support/renderApp';

describe('useFieldArray', () => {
  it('should behaviour correctly without defaultValues', async () => {
    await renderApp('http://localhost:3000/useFieldArray/normal');
    await userEvent.click(document.querySelector('#appendAsync')!);

    await vi.waitFor(() =>
      expect(document.activeElement).toHaveAttribute('id', 'field0'),
    );

    expect(
      (
        Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
          'input',
        ) as HTMLInputElement
      ).value,
    ).toBe('appendAsync');

    await vi.waitFor(() =>
      expect(document.activeElement).toHaveAttribute('id', 'field0'),
    );

    await userEvent.click(document.querySelector('#prependAsync')!);

    await vi.waitFor(() =>
      expect(
        (
          Array.from(document.querySelectorAll('ul > li'))[0]?.querySelector(
            'input',
          ) as HTMLInputElement
        ).value,
      ).toBe('prependAsync'),
    );

    await userEvent.click(document.querySelector('#insertAsync')!);

    await vi.waitFor(() =>
      expect(document.activeElement).toHaveAttribute('id', 'field1'),
    );

    expect(
      (
        document.querySelector('#field1')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('insertAsync');

    await userEvent.click(document.querySelector('#swapAsync')!);

    await vi.waitFor(() =>
      expect(
        (
          document.querySelector('#field0')! as
            | HTMLInputElement
            | HTMLSelectElement
        ).value,
      ).toBe('insertAsync'),
    );
    expect(
      (
        document.querySelector('#field1')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('prependAsync');

    await userEvent.click(document.querySelector('#moveAsync')!);

    await vi.waitFor(() =>
      expect(
        (
          document.querySelector('#field1')! as
            | HTMLInputElement
            | HTMLSelectElement
        ).value,
      ).toBe('insertAsync'),
    );
    expect(
      (
        document.querySelector('#field0')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('prependAsync');

    await userEvent.click(document.querySelector('#updateAsync')!);

    await vi.waitFor(() =>
      expect(
        (
          document.querySelector('#field0')! as
            | HTMLInputElement
            | HTMLSelectElement
        ).value,
      ).toBe('updateAsync'),
    );

    await userEvent.click(document.querySelector('#replaceAsync')!);

    await new Promise((resolve) => setTimeout(resolve, 100));
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

    await userEvent.click(document.querySelector('#removeAsync')!);

    await userEvent.click(document.querySelector('#resetAsync')!);

    await vi.waitFor(() =>
      expect(document.querySelector('ul > li')).toBeNull(),
    );
  });
});
