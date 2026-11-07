import { expect, test } from '@playwright/test';

test.describe('DevTool', () => {
  test('should toggle the panel and show field state', async ({ page }) => {
    await page.goto('/devtool');

    const panel = page.getByRole('complementary', {
      name: 'React Hook Form DevTools',
    });

    await expect(panel).toBeHidden();

    await page.getByRole('button', { name: 'Show dev panel' }).click();

    await expect(panel).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Close dev panel' }),
    ).toBeFocused();
    await expect(panel.getByText('address.city')).toBeVisible();
    await expect(panel.getByText('items.0.name')).toBeVisible();
    await expect(panel.getByText('"bill"')).toBeVisible();

    await page.getByPlaceholder('firstName').fill('');
    await page.getByRole('button', { name: 'submit' }).click();

    await expect(panel.getByText('First name is required')).toBeVisible();
    await expect(panel.getByText('City is required')).toBeVisible();

    await page.getByRole('button', { name: 'append' }).click();
    await expect(panel.getByText('items.1.name')).toBeVisible();

    await panel.getByRole('searchbox', { name: 'Filter fields' }).fill('city');
    await expect(panel.getByText('address.city')).toBeVisible();
    await expect(panel.getByText('firstName')).toBeHidden();

    await page.getByRole('button', { name: 'Close dev panel' }).click();
    await expect(panel).toBeHidden();
  });

  test('should keep the panel open after reload', async ({ page }) => {
    await page.goto('/devtool?placement=bottom-left');
    await page.getByRole('button', { name: 'Show dev panel' }).click();
    await page.reload();

    await expect(
      page.getByRole('complementary', { name: 'React Hook Form DevTools' }),
    ).toBeVisible();
  });

  test('should drag the toggle button and remember its position', async ({
    page,
  }) => {
    await page.goto('/devtool');

    const toggle = page.getByRole('button', { name: 'Show dev panel' });
    const panel = page.getByRole('complementary', {
      name: 'React Hook Form DevTools',
    });
    const box = await toggle.boundingBox();

    await page.mouse.move(box!.x + 20, box!.y + 20);
    await page.mouse.down();
    await page.mouse.move(120, 300, { steps: 5 });
    await page.mouse.up();

    await expect(panel).toBeHidden();
    await expect(toggle).toHaveCSS('left', '100px');
    await expect(toggle).toHaveCSS('top', '280px');

    await page.reload();
    await expect(toggle).toHaveCSS('left', '100px');
    await expect(toggle).toHaveCSS('top', '280px');

    await toggle.click();
    await expect(panel).toBeVisible();
    expect((await panel.boundingBox())!.x).toBeLessThan(100);
  });
});
