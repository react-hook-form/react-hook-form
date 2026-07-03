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
    await userEvent.click(el);
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

export async function blur(selector: string) {
  const el = $(selector) as HTMLInputElement;

  if (el.type === 'radio' || el.type === 'checkbox') {
    fireEvent.blur(el);
    return;
  }

  await userEvent.click(el);
  await userEvent.click(document.body);
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
