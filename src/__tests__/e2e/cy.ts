import { fireEvent } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

export function $(selector: string): HTMLElement {
  const el = document.querySelector(selector);
  if (!el) {
    throw new Error(`Element not found: ${selector}`);
  }
  return el as HTMLElement;
}

export function $$(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll(selector)) as HTMLElement[];
}

export async function click(selector: string) {
  await userEvent.click($(selector));
}

export async function clickAt(selector: string, index: number) {
  const els = $$(selector);
  if (!els[index]) {
    throw new Error(`Element not found: ${selector} at index ${index}`);
  }
  await userEvent.click(els[index]);
}

export async function type(selector: string, text: string) {
  const el = $(selector) as HTMLInputElement;

  if (el.type === 'date') {
    await userEvent.fill(el, text);
    return;
  }

  await userEvent.type(el, text);
}

export async function clear(selector: string) {
  await userEvent.clear($(selector));
}

export async function clearAndType(selector: string, text: string) {
  await userEvent.clear($(selector));
  await userEvent.type($(selector), text);
}

export async function selectOption(
  selector: string,
  values: string | readonly string[],
) {
  const vals = Array.isArray(values) ? values : [values];
  await userEvent.selectOptions($(selector), vals);
}

export async function check(selector: string, value?: string) {
  const el =
    value === undefined
      ? ($(selector) as HTMLInputElement)
      : (document.querySelector(
          `${selector}[value="${value}"]`,
        ) as HTMLInputElement);

  if (!el) {
    throw new Error(
      value === undefined
        ? `Element not found: ${selector}`
        : `Element not found: ${selector}[value="${value}"]`,
    );
  }

  if (!el.checked) {
    if (el.type === 'radio') {
      fireEvent.click(el);
    } else {
      await userEvent.click(el);
    }
  }
}

export async function focus(selector: string) {
  const el = $(selector) as HTMLInputElement;

  if (el.type === 'radio' || el.type === 'checkbox') {
    fireEvent.focus(el);
    return;
  }

  await userEvent.click(el);
}

export async function focusAt(selector: string, index: number) {
  const el = $$(selector)[index] as HTMLInputElement;

  if (!el) {
    throw new Error(`Element not found: ${selector} at index ${index}`);
  }

  if (el.type === 'radio' || el.type === 'checkbox') {
    fireEvent.focus(el);
    return;
  }

  await userEvent.click(el);
}

export async function blurAt(selector: string, index: number) {
  const el = $$(selector)[index] as HTMLInputElement;

  if (!el) {
    throw new Error(`Element not found: ${selector} at index ${index}`);
  }

  if (el.type === 'radio' || el.type === 'checkbox') {
    fireEvent.blur(el);
    return;
  }

  await userEvent.click(el);
  await userEvent.click(document.body);
  if (document.activeElement === el) {
    el.blur();
  }
}

export async function blur(selector: string) {
  const el = $(selector) as HTMLInputElement;

  if (el.type === 'radio' || el.type === 'checkbox') {
    fireEvent.blur(el);
    return;
  }

  await userEvent.click(el);
  await userEvent.click(document.body);
  if (document.activeElement === el) {
    el.blur();
  }
}

export function expectInputError(inputSelector: string, text: string) {
  const inputs = document.querySelectorAll(inputSelector);
  const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];

  if (!input) {
    throw new Error(`Element not found: ${inputSelector}`);
  }

  const sibling = input.nextElementSibling;
  expect(sibling?.textContent).toContain(text);
}

export function expectContains(selector: string, text: string) {
  expect($(selector).textContent).toContain(text);
}

export function expectNoErrorMessages() {
  const errors = Array.from(document.querySelectorAll('p')).filter((p) =>
    p.textContent?.includes('error'),
  );
  expect(errors).toHaveLength(0);
}

export function expectNoParagraphs() {
  expectNoErrorMessages();
}

export function expectPreJson(selector: string, expected: unknown) {
  expect(JSON.parse($(selector).textContent ?? '')).toEqual(expected);
}

export function expectEmptyValue(selector: string) {
  const el = $(selector) as HTMLInputElement | HTMLSelectElement;

  if (el instanceof HTMLInputElement && el.type === 'radio') {
    expect(
      document.querySelector(`input[name="${el.name}"]:checked`),
    ).toBeNull();
    return;
  }

  if (el instanceof HTMLInputElement && el.type === 'checkbox') {
    expect(el.checked).toBe(false);
    return;
  }

  expect(el.value).toBe('');
}

export function expectValue(selector: string, value: string) {
  expect(($(selector) as HTMLInputElement | HTMLSelectElement).value).toBe(
    value,
  );
}

export function expectChecked(selector: string) {
  expect(($(selector) as HTMLInputElement).checked).toBe(true);
}

export function expectNotExist(selector: string) {
  expect(document.querySelector(selector)).toBeNull();
}

export function expectExist(selector: string) {
  expect(document.querySelector(selector)).not.toBeNull();
}

export function expectLength(selector: string, length: number) {
  expect(document.querySelectorAll(selector)).toHaveLength(length);
}

export async function waitFor(callback: () => void, timeout = 5000) {
  await vi.waitFor(callback, { timeout });
}

export function fireChange(selector: string, value: string) {
  fireEvent.change($(selector), { target: { value } });
}

export async function setInputValue(selector: string, value: string) {
  const el = $(selector) as HTMLInputElement;
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  )?.set;

  nativeInputValueSetter?.call(el, value);
  fireEvent.input(el, { target: { value } });
  fireEvent.change(el, { target: { value } });
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function clickButtonWithText(text: string) {
  const button = Array.from(document.querySelectorAll('button')).find((el) =>
    el.textContent?.includes(text),
  );
  if (!button) {
    throw new Error(`Button not found with text: ${text}`);
  }
  await userEvent.click(button);
}

export function expectFocused(selector: string) {
  expect(document.activeElement).toBe($(selector));
}

export function expectValueAt(selector: string, index: number, value: string) {
  expect(($$(selector)[index] as HTMLInputElement).value).toBe(value);
}

export function expectCheckedAt(selector: string, index: number) {
  expect(($$(selector)[index] as HTMLInputElement).checked).toBe(true);
}

export function expectNotCheckedAt(selector: string, index: number) {
  expect(($$(selector)[index] as HTMLInputElement).checked).toBe(false);
}

export function expectEmpty(selector: string) {
  expect($(selector).textContent).toBe('');
}

export function expectJson(selector: string, expected: unknown) {
  expectPreJson(selector, expected);
}

export function expectFocusedAttr(attr: string, value: string) {
  expect(document.activeElement).toHaveAttribute(attr, value);
}

export async function uncheck(selector: string) {
  const el = $(selector) as HTMLInputElement;

  if (el.checked) {
    await userEvent.click(el);
  }
}

export function expectLiInputValue(index: number, value: string) {
  const input = $$('ul > li')[index]?.querySelector('input') as HTMLInputElement;

  if (!input) {
    throw new Error(`No input at li index ${index}`);
  }

  expect(input.value).toBe(value);
}

export function expectSelectValues(selector: string, values: readonly string[]) {
  const el = $(selector) as HTMLSelectElement;
  expect(Array.from(el.selectedOptions).map((option) => option.value)).toEqual([
    ...values,
  ]);
}

export function expectParagraphCount(count: number) {
  expect(document.querySelectorAll('p')).toHaveLength(count);
}

export function expectBoldCount(count: number) {
  expect(document.querySelectorAll('b')).toHaveLength(count);
}

export async function clickButtonContaining(text: string) {
  const button = Array.from(document.querySelectorAll('button')).find((el) =>
    el.textContent?.includes(text),
  );

  if (!button) {
    throw new Error(`Button not found containing text: ${text}`);
  }

  await userEvent.click(button);
}

export async function clickFirstMuiPopoverOption() {
  await userEvent.click(document.querySelector('.MuiPopover-root ul > li')!);
}

export async function fill(selector: string, text: string) {
  await userEvent.fill($(selector), text);
}

export function getFieldArraySubmitData() {
  return $$('ul > li').map((li) => {
    const nameInput = li.querySelector(
      'input[name$=".name"]',
    ) as HTMLInputElement;
    const conditionalInput = li.querySelector(
      'input[name$=".conditional"]',
    ) as HTMLInputElement | null;

    if (conditionalInput) {
      return { name: nameInput.value, conditional: conditionalInput.value };
    }

    return { name: nameInput.value };
  });
}

export async function focusMuiSelect(selector: string) {
  fireEvent.focus($(selector));
}

export async function blurMuiSelect(selector: string) {
  fireEvent.blur($(selector));
}

export function blurInput(selector: string) {
  fireEvent.blur($(selector));
}

export function getReplaceFieldValues() {
  return $$('ul > li').map(
    (li) => (li.querySelector('input') as HTMLInputElement).value,
  );
}

export async function clickFieldArray(buttonSelector: string, liIndex: number) {
  await click(buttonSelector);
  await waitFor(() => {
    expect($$('ul > li')[liIndex]?.querySelector('input')?.value).toBeTruthy();
  });
  return ($$('ul > li')[liIndex]?.querySelector('input') as HTMLInputElement)
    .value;
}

export function getCounterText(selector: string) {
  const text = $(selector).textContent ?? '';
  return Number.parseInt(text.match(/(\d+)/)?.[1] ?? '0', 10);
}

export function expectCounterDelta(
  selector: string,
  from: number,
  delta: number,
) {
  const actual = getCounterText(selector) - from;
  expect(actual).toBeGreaterThanOrEqual(delta - 2);
  expect(actual).toBeLessThanOrEqual(delta + 2);
}
