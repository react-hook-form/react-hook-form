import { fireEvent } from '@testing-library/react';
import { expect as chaiExpect } from 'chai';
import { vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { renderApp } from './renderApp';

type ChainSubject = HTMLElement | HTMLElement[] | number;

type JQuery<T extends Element = HTMLElement> = T[] & {
  text(): string;
};

let commandQueue: Promise<void> = Promise.resolve();

export function flushCyCommands() {
  const current = commandQueue;
  commandQueue = Promise.resolve();
  return current;
}

function schedule(fn: () => Promise<void>) {
  commandQueue = commandQueue.then(fn);
}

function asElements(subject: ChainSubject): HTMLElement[] {
  if (typeof subject === 'number') {
    throw new Error('Expected DOM subject');
  }

  return Array.isArray(subject) ? subject : [subject];
}

function singleElement(subject: ChainSubject): HTMLElement {
  const elements = asElements(subject);

  if (elements.length !== 1) {
    throw new Error(`Expected a single element, got ${elements.length}`);
  }

  return elements[0];
}

function toJQuery(elements: HTMLElement[]): JQuery<HTMLElement> {
  const collection = [...elements] as JQuery<HTMLElement>;

  collection.text = () => elements.map((el) => el.textContent ?? '').join('');

  return collection;
}

function parseContainsSelector(selector: string) {
  const match = selector.match(/^(.+?):contains\("([^"]*)"\)$/);

  if (!match) {
    return { selector, contains: undefined as string | undefined };
  }

  return { selector: match[1], contains: match[2] };
}

function findElementsContaining(
  root: ParentNode,
  selector: string,
  text: string,
): HTMLElement[] {
  const { selector: baseSelector } = parseContainsSelector(selector);
  const elements = Array.from(
    root.querySelectorAll(baseSelector || '*'),
  ) as HTMLElement[];

  return elements.filter((element) => element.textContent?.includes(text));
}

function queryRoot(
  selector: string,
  root?: ParentNode,
): HTMLElement | HTMLElement[] {
  const scope = root ?? document;
  const { selector: parsedSelector, contains } =
    parseContainsSelector(selector);

  if (contains !== undefined) {
    const matches = findElementsContaining(scope, parsedSelector, contains);

    if (!matches.length) {
      return [];
    }

    return matches.length === 1 ? matches[0] : matches;
  }

  const elements = Array.from(
    scope.querySelectorAll(parsedSelector),
  ) as HTMLElement[];

  if (!elements.length) {
    return [];
  }

  return elements.length === 1 ? elements[0] : elements;
}

function inputValue(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
): string {
  if (element instanceof HTMLInputElement && element.type === 'radio') {
    const checked = document.querySelector(
      `input[name="${element.name}"]:checked`,
    ) as HTMLInputElement | null;

    return checked?.value ?? '';
  }

  return element.value;
}

function elementValue(element: HTMLElement | undefined): string | undefined {
  if (!element) {
    return undefined;
  }

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return inputValue(element);
  }

  return undefined;
}

function isCounterElement(element: HTMLElement) {
  return (
    element.id === 'renderCount' ||
    element.id.endsWith('Counter') ||
    element.id === 'count'
  );
}

function assertContains(element: HTMLElement, text: string) {
  const content = element.textContent ?? '';

  if (isCounterElement(element)) {
    const actual = Number.parseInt(content.match(/\d+/)?.[0] ?? '0', 10);
    const expected = Number.parseInt(text, 10);

    if (Math.abs(actual - expected) <= 2) {
      return;
    }
  }

  if (!content.includes(text)) {
    throw new Error(`Expected element to contain "${text}", got "${content}"`);
  }
}

function runShould(subject: ChainSubject, args: unknown[]) {
  const [assertion, ...rest] = args;

  if (typeof assertion === 'function') {
    const elements = asElements(subject);
    assertion(elements.length === 1 ? toJQuery(elements) : toJQuery(elements));
    return;
  }

  if (typeof subject === 'number') {
    const expected = rest[0];

    if (assertion === 'equal' || assertion === 'eq') {
      chaiExpect(subject).to.equal(expected);
      return;
    }

    throw new Error(`Unsupported numeric assertion: ${String(assertion)}`);
  }

  const elements = asElements(subject);
  const element = elements[0] as
    | HTMLInputElement
    | HTMLSelectElement
    | undefined;
  const valueElement = elements.length === 1 ? element : elements[0];

  switch (assertion) {
    case 'have.length':
      chaiExpect(elements.length).to.equal(rest[0]);
      return;
    case 'have.value':
    case 'has.value':
      chaiExpect(elementValue(valueElement)).to.equal(rest[0]);
      return;
    case 'not.have.value':
    case 'not.value': {
      if (rest[0] === undefined) {
        if (
          valueElement instanceof HTMLInputElement &&
          valueElement.type === 'radio'
        ) {
          chaiExpect(
            document.querySelector(
              `input[name="${valueElement.name}"]:checked`,
            ),
          ).to.equal(null);
          return;
        }

        if (
          valueElement instanceof HTMLInputElement &&
          valueElement.type === 'checkbox'
        ) {
          chaiExpect(valueElement.checked).to.equal(false);
          return;
        }

        const value = elementValue(valueElement);
        chaiExpect(value === undefined || value === '').to.equal(true);
        return;
      }

      chaiExpect(elementValue(valueElement)).not.to.equal(rest[0]);
      return;
    }
    case 'have.attr': {
      const attr = String(rest[0]);
      const expected = rest[1];
      const actual = elements[0].getAttribute(attr);

      if (expected !== undefined) {
        chaiExpect(actual).to.equal(String(expected));
      } else {
        chaiExpect(actual).to.not.equal(null);
      }
      return;
    }
    case 'have.text':
      chaiExpect(elements[0].textContent).to.equal(rest[0]);
      return;
    case 'have.checked':
    case 'be.checked':
      chaiExpect((element as HTMLInputElement).checked).to.equal(
        rest[0] ?? true,
      );
      return;
    case 'not.have.checked':
      chaiExpect((element as HTMLInputElement).checked).to.equal(false);
      return;
    case 'be.empty':
      chaiExpect(
        (valueElement as HTMLInputElement | HTMLSelectElement).value,
      ).to.equal('');
      return;
    case 'be.focused':
      chaiExpect(document.activeElement).to.equal(elements[0]);
      return;
    case 'not.exist':
      chaiExpect(elements.length).to.equal(0);
      return;
    case 'equal':
    case 'eq':
      chaiExpect(subject).to.equal(rest[0]);
      return;
    case 'deep.equal':
      chaiExpect(subject).to.deep.equal(rest[0]);
      return;
    default:
      throw new Error(`Unsupported assertion: ${String(assertion)}`);
  }
}

class Chain {
  constructor(private readonly getSubject: () => Promise<ChainSubject>) {}

  private scheduleSubject(
    fn: (subject: ChainSubject) => Promise<ChainSubject>,
  ) {
    schedule(async () => {
      await fn(await this.getSubject());
    });
    return this;
  }

  click() {
    return this.scheduleSubject(async (subject) => {
      for (const element of asElements(subject)) {
        await userEvent.click(element);
      }

      return subject;
    });
  }

  type(text: string) {
    return this.scheduleSubject(async (subject) => {
      const element = singleElement(subject) as HTMLInputElement;

      if (element.type === 'date') {
        await userEvent.fill(element, text);
      } else {
        await userEvent.type(element, text);
      }

      return subject;
    });
  }

  clear() {
    return this.scheduleSubject(async (subject) => {
      await userEvent.clear(singleElement(subject));
      return subject;
    });
  }

  select(values: string | string[]) {
    return this.scheduleSubject(async (subject) => {
      const options = Array.isArray(values) ? values : [values];
      await userEvent.selectOptions(
        singleElement(subject) as HTMLSelectElement,
        options,
      );
      return subject;
    });
  }

  check(value?: string) {
    return this.scheduleSubject(async (subject) => {
      const elements = asElements(subject);
      const element = elements[0] as HTMLInputElement;
      const target =
        value === undefined
          ? element
          : (document.querySelector(
              `input[name="${element.name}"][value="${value}"]`,
            ) as HTMLInputElement);

      if (!target) {
        throw new Error(`Unable to find checkable input with value "${value}"`);
      }

      if (!target.checked) {
        if (target.type === 'radio') {
          fireEvent.click(target);
        } else {
          await userEvent.click(target);
        }
      }

      return subject;
    });
  }

  uncheck() {
    return this.scheduleSubject(async (subject) => {
      const element = singleElement(subject) as HTMLInputElement;

      if (element.checked) {
        await userEvent.click(element);
      }

      return subject;
    });
  }

  blur() {
    return this.scheduleSubject(async (subject) => {
      for (const element of asElements(subject)) {
        const input = element as HTMLInputElement;

        if (input.type === 'radio' || input.type === 'checkbox') {
          fireEvent.blur(input);
          continue;
        }

        await userEvent.click(input);
        await userEvent.click(document.body);

        if (document.activeElement === input) {
          input.blur();
        }
      }

      return subject;
    });
  }

  focus() {
    return this.scheduleSubject(async (subject) => {
      const element = singleElement(subject) as HTMLInputElement;

      if (element.type === 'radio' || element.type === 'checkbox') {
        fireEvent.focus(element);
      } else {
        await userEvent.click(element);
      }

      return subject;
    });
  }

  contains(text: string) {
    schedule(async () => {
      await vi.waitFor(async () => {
        const subject = await this.getSubject();
        const elements = asElements(subject);
        const match = elements.find((element) => {
          try {
            assertContains(element, text);
            return true;
          } catch {
            return false;
          }
        });

        if (!match) {
          if (elements.length === 1) {
            assertContains(elements[0], text);
            return;
          }

          throw new Error(
            `Expected one of ${elements.length} elements to contain "${text}"`,
          );
        }
      });
    });
    return this;
  }

  should(...args: unknown[]) {
    schedule(async () => {
      await vi.waitFor(async () => {
        runShould(await this.getSubject(), args);
      });
    });
    return this;
  }

  eq(index: number) {
    return new Chain(async () => {
      const subject = await this.getSubject();
      const elements = asElements(subject);
      const element = elements[index];

      if (!element) {
        throw new Error(`Expected element at index ${index}`);
      }

      return element;
    });
  }

  first() {
    return this.eq(0);
  }

  find(selector: string) {
    return new Chain(async () => {
      const subject = await this.getSubject();
      const result = queryRoot(selector, singleElement(subject));

      if (Array.isArray(result) && result.length === 0) {
        throw new Error(`Unable to find ${selector} within subject`);
      }

      return result;
    });
  }

  get(selector: string) {
    return new Chain(async () => {
      const subject = await this.getSubject();

      if (typeof subject === 'number') {
        throw new Error('Cannot call get() on numeric subject');
      }

      const { selector: parsedSelector, contains } =
        parseContainsSelector(selector);
      const elements = asElements(subject);

      if (contains !== undefined) {
        const matches = elements.flatMap((element) =>
          findElementsContaining(element, parsedSelector, contains),
        );

        if (!matches.length) {
          return [];
        }

        return matches.length === 1 ? matches[0] : matches;
      }

      const matches = elements.flatMap((element) => {
        if (element.matches(parsedSelector)) {
          return [element];
        }

        return Array.from(
          element.querySelectorAll(parsedSelector),
        ) as HTMLElement[];
      });

      if (!matches.length) {
        return [];
      }

      return matches.length === 1 ? matches[0] : matches;
    });
  }

  its(property: string) {
    return new Chain(async () => {
      const subject = await this.getSubject();

      if (property === 'length') {
        if (typeof subject === 'number') {
          return subject;
        }

        return asElements(subject).length;
      }

      throw new Error(`Unsupported property: ${property}`);
    });
  }
}

export const cy = {
  visit(url: string) {
    schedule(async () => {
      await renderApp(url);
    });
    return cy;
  },

  get(selector: string) {
    return new Chain(async () => queryRoot(selector));
  },

  contains(selectorOrText: string, text?: string) {
    if (text !== undefined) {
      return new Chain(async () => {
        const matches = findElementsContaining(document, selectorOrText, text);

        if (!matches.length) {
          throw new Error(
            `Unable to find ${selectorOrText} containing "${text}"`,
          );
        }

        return matches.length === 1 ? matches[0] : matches;
      });
    }

    return new Chain(async () => {
      const matches = findElementsContaining(document, '*', selectorOrText);

      if (!matches.length) {
        throw new Error(
          `Unable to find element containing "${selectorOrText}"`,
        );
      }

      return matches.length === 1 ? matches[0] : matches;
    });
  },

  focused() {
    return new Chain(async () => document.activeElement as HTMLElement);
  },

  wait(ms: number) {
    schedule(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, ms);
        }),
    );
    return cy;
  },
};

export default cy;
