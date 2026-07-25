import { expect, test } from '@playwright/test';

import { type } from './utils';

test.describe('change input type', () => {
  test('should keep the DOM input in sync with internal state when the input type changes back and forth to checkbox', async ({
    page,
  }) => {
    await page.goto('/changeInputType');

    await expect(page.locator('input[name="value"]')).toHaveValue('hello');
    await expect
      .poll(async () =>
        JSON.parse((await page.locator('#state').textContent()) || 'null'),
      )
      .toEqual({
        type: 'text',
        value: 'hello',
      });

    await page.locator('input[name="type"]').clear();
    await type(page.locator('input[name="type"]'), 'number');
    await page.locator('input[name="type"]').blur();
    await expect
      .poll(async () =>
        JSON.parse((await page.locator('#state').textContent()) || 'null'),
      )
      .toEqual({
        type: 'number',
        value: 42,
      });
    await expect(page.locator('input[name="value"]')).toHaveValue('42');

    await page.locator('input[name="type"]').clear();
    await type(page.locator('input[name="type"]'), 'checkbox');
    await page.locator('input[name="type"]').blur();
    await expect
      .poll(async () =>
        JSON.parse((await page.locator('#state').textContent()) || 'null'),
      )
      .toEqual({
        type: 'checkbox',
        value: true,
      });
    await expect(page.locator('input[name="value"]')).toBeChecked();

    await page.locator('input[name="type"]').clear();
    await type(page.locator('input[name="type"]'), 'number');
    await page.locator('input[name="type"]').blur();
    await expect
      .poll(async () =>
        JSON.parse((await page.locator('#state').textContent()) || 'null'),
      )
      .toEqual({
        type: 'number',
        value: 42,
      });
    await expect(page.locator('input[name="value"]')).toHaveValue('42');

    await page.locator('input[name="type"]').clear();
    await type(page.locator('input[name="type"]'), 'text');
    await page.locator('input[name="type"]').blur();
    await expect
      .poll(async () =>
        JSON.parse((await page.locator('#state').textContent()) || 'null'),
      )
      .toEqual({
        type: 'text',
        value: 'hello',
      });
    await expect(page.locator('input[name="value"]')).toHaveValue('hello');
  });
});
