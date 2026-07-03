import { describe, it } from 'vitest';

import * as cy from '../support/cy';
import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('useFieldArray', () => {
  it('should behaviour correctly without defaultValues', async () => {
    await renderApp('http://localhost:3000/useFieldArray/normal');
    const renderCountStart = getRenderCount();

    const append1 = await cy.clickFieldArray('#append', 0);
    cy.expectLength('ul > li', 1);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [{ name: append1 }],
    });

    const prepend1 = await cy.clickFieldArray('#prepend', 0);
    cy.expectLength('ul > li', 2);
    cy.expectLiInputValue(0, prepend1);

    const append2 = await cy.clickFieldArray('#append', 2);
    cy.expectLength('ul > li', 3);
    cy.expectLiInputValue(2, append2);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [{ name: prepend1 }, { name: append1 }, { name: append2 }],
    });

    await cy.click('#swap');
    cy.expectLiInputValue(1, append2);
    cy.expectLiInputValue(2, append1);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [{ name: prepend1 }, { name: append2 }, { name: append1 }],
    });

    await cy.click('#move');
    cy.expectLiInputValue(0, append1);
    cy.expectLiInputValue(1, prepend1);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [{ name: append1 }, { name: prepend1 }, { name: append2 }],
    });

    const insert1 = await cy.clickFieldArray('#insert', 1);
    cy.expectLiInputValue(1, insert1);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [
        { name: append1 },
        { name: insert1 },
        { name: prepend1 },
        { name: append2 },
      ],
    });

    await cy.click('#remove');
    cy.expectLiInputValue(0, append1);
    cy.expectLiInputValue(1, prepend1);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [{ name: append1 }, { name: prepend1 }, { name: append2 }],
    });

    await cy.click('#delete1');

    cy.expectLength('ul > li', 2);

    cy.expectLiInputValue(0, append1);
    cy.expectLiInputValue(1, append2);

    await cy.click('#delete1');

    cy.expectLength('ul > li', 1);

    cy.expectLiInputValue(0, append1);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [{ name: append1 }],
    });

    await cy.click('#update');

    cy.expectLiInputValue(0, 'changed');

    await cy.click('#removeAll');
    cy.expectLength('ul > li', 0);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [],
    });

    const asyncAppend1 = await cy.clickFieldArray('#append', 0);
    await cy.click('#append');
    await cy.click('#append');

    await cy.click('#removeAsync');
    await cy.wait(100);
    await cy.click('#removeAsync');
    await cy.wait(100);

    cy.expectLength('input', 1);

    await cy.click('#submit');

    cy.expectJson('#result', {
      data: [{ name: asyncAppend1 }],
    });

    expectRenderCountDelta(renderCountStart, 41);
  });

  it('should behaviour correctly with defaultValue', async () => {
    await renderApp('http://localhost:3000/useFieldArray/default');
    const renderCountStart = getRenderCount();

    cy.expectLength('ul > li', 3);

    cy.expectLiInputValue(0, 'test');

    cy.expectLiInputValue(1, 'test1');

    cy.expectLiInputValue(2, 'test2');

    const appendVal = await cy.clickFieldArray('#append', 3);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [
        { name: 'test' },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    const prependVal = await cy.clickFieldArray('#prepend', 0);
    cy.expectLength('ul > li', 5);

    cy.expectLiInputValue(0, prependVal);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [
        { name: prependVal },
        { name: 'test' },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await cy.click('#swap');
    cy.expectLiInputValue(1, 'test1');
    cy.expectLiInputValue(2, 'test');

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [
        { name: prependVal },
        { name: 'test1' },
        { name: 'test' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await cy.click('#move');
    cy.expectLiInputValue(0, 'test');
    cy.expectLiInputValue(1, prependVal);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [
        { name: 'test' },
        { name: prependVal },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    const insertVal = await cy.clickFieldArray('#insert', 1);
    cy.expectLiInputValue(1, insertVal);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [
        { name: 'test' },
        { name: insertVal },
        { name: prependVal },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await cy.click('#remove');
    cy.expectLiInputValue(0, 'test');
    cy.expectLiInputValue(1, prependVal);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [
        { name: 'test' },
        { name: prependVal },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await cy.click('#delete2');

    cy.expectLength('ul > li', 4);

    cy.expectLiInputValue(0, 'test');
    cy.expectLiInputValue(1, prependVal);
    cy.expectLiInputValue(2, 'test2');
    cy.expectLiInputValue(3, appendVal);

    await cy.click('#delete3');

    cy.expectLength('ul > li', 3);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [{ name: 'test' }, { name: prependVal }, { name: 'test2' }],
    });

    await cy.click('#removeAll');
    cy.expectLength('ul > li', 0);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [],
    });

    const finalAppend = await cy.clickFieldArray('#append', 0);

    cy.expectLiInputValue(0, finalAppend);

    const finalPrepend = await cy.clickFieldArray('#prepend', 0);

    cy.expectLiInputValue(0, finalPrepend);

    expectRenderCountDelta(renderCountStart, 32);
  });

  it('should behaviour correctly with defaultValue and without auto focus', async () => {
    await renderApp(
      'http://localhost:3000/useFieldArray/defaultAndWithoutFocus',
    );
    const renderCountStart = getRenderCount();

    cy.expectLength('ul > li', 3);

    cy.expectLiInputValue(0, 'test');

    cy.expectLiInputValue(1, 'test1');

    cy.expectLiInputValue(2, 'test2');

    const appendVal = await cy.clickFieldArray('#append', 3);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [
        { name: 'test' },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    const prependVal = await cy.clickFieldArray('#prepend', 0);
    cy.expectLength('ul > li', 5);

    cy.expectLiInputValue(0, prependVal);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [
        { name: prependVal },
        { name: 'test' },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await cy.click('#swap');
    cy.expectLiInputValue(1, 'test1');
    cy.expectLiInputValue(2, 'test');

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [
        { name: prependVal },
        { name: 'test1' },
        { name: 'test' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await cy.click('#move');
    cy.expectLiInputValue(0, 'test');
    cy.expectLiInputValue(1, prependVal);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [
        { name: 'test' },
        { name: prependVal },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    const insertVal = await cy.clickFieldArray('#insert', 1);
    cy.expectLiInputValue(1, insertVal);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [
        { name: 'test' },
        { name: insertVal },
        { name: prependVal },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await cy.click('#remove');
    cy.expectLiInputValue(0, 'test');
    cy.expectLiInputValue(1, prependVal);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [
        { name: 'test' },
        { name: prependVal },
        { name: 'test1' },
        { name: 'test2' },
        { name: appendVal },
      ],
    });

    await cy.click('#delete2');

    cy.expectLength('ul > li', 4);

    cy.expectLiInputValue(0, 'test');
    cy.expectLiInputValue(1, prependVal);
    cy.expectLiInputValue(2, 'test2');
    cy.expectLiInputValue(3, appendVal);

    await cy.click('#delete3');

    cy.expectLength('ul > li', 3);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [{ name: 'test' }, { name: prependVal }, { name: 'test2' }],
    });

    await cy.click('#removeAll');
    cy.expectLength('ul > li', 0);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: [],
    });

    const finalAppend = await cy.clickFieldArray('#append', 0);

    cy.expectLiInputValue(0, finalAppend);

    const finalPrepend = await cy.clickFieldArray('#prepend', 0);

    cy.expectLiInputValue(0, finalPrepend);

    expectRenderCountDelta(renderCountStart, 28);
  });

  it('should replace fields with new values', async () => {
    await renderApp('http://localhost:3000/useFieldArray/normal');
    const renderCountStart = getRenderCount();
    await cy.click('#replace');
    const replaceValues = cy.getReplaceFieldValues();
    cy.expectLiInputValue(0, replaceValues[0]);
    cy.expectLiInputValue(1, replaceValues[1]);
    cy.expectLiInputValue(2, replaceValues[2]);
    cy.expectLiInputValue(3, replaceValues[3]);

    await cy.click('#submit');
    cy.expectJson('#result', {
      data: replaceValues.map((name) => ({ name })),
    });
  });

  it('should display the correct dirty value with default value', async () => {
    await renderApp('http://localhost:3000/useFieldArray/default');
    const renderCountStart = getRenderCount();
    cy.expectContains('#dirty', 'no');
    await cy.click('#update');
    cy.expectJson('#dirtyFields', {
      data: [{ name: true }, null, null],
    });
    cy.expectContains('#dirty', 'yes');
    await cy.click('#updateRevert');
    cy.expectContains('#dirty', 'no');
    await cy.click('#append');
    await cy.type('#field1', 'test');
    await cy.click('#prepend');
    await cy.click('#delete2');
    cy.expectJson('#dirtyFields', {
      data: [{ name: true }, { name: true }, null, { name: true }],
    });
    await cy.click('#delete2');
    cy.expectJson('#dirtyFields', {
      data: [{ name: true }, { name: true }, { name: true }],
    });
    await cy.click('#delete1');
    cy.expectJson('#dirtyFields', {
      data: [{ name: true }, { name: true }, { name: true }],
    });
    await cy.click('#delete1');
    cy.expectJson('#dirtyFields', {
      data: [{ name: true }, { name: true }, { name: true }],
    });
    await cy.click('#delete0');
    cy.expectJson('#dirtyFields', {
      data: [{ name: true }, { name: true }, { name: true }],
    });
    cy.expectContains('#dirty', 'yes');
    expectRenderCountDelta(renderCountStart, 14);
  });

  it('should display the correct dirty value without default value', async () => {
    await renderApp('http://localhost:3000/useFieldArray/normal');
    const renderCountStart = getRenderCount();
    cy.expectContains('#dirty', 'no');
    await cy.click('#append');
    cy.expectContains('#dirty', 'yes');
    await cy.focus('#field0');
    await cy.blur('#field0');
    cy.expectJson('#dirtyFields', {
      data: [{ name: true }],
    });
    cy.expectContains('#dirty', 'yes');
    await cy.type('#field0', 'test');
    await cy.blur('#field0');
    cy.expectContains('#dirty', 'yes');
    await cy.click('#prepend');
    await cy.click('#prepend');
    cy.expectJson('#dirtyFields', {
      data: [{ name: true }, { name: true }, { name: true }],
    });
    await cy.click('#delete0');
    cy.expectJson('#dirtyFields', {
      data: [{ name: true }, { name: true }],
    });

    await cy.click('#delete1');
    cy.expectJson('#dirtyFields', {
      data: [{ name: true }],
    });

    await cy.click('#delete0');
    cy.expectJson('#dirtyFields', {});

    cy.expectContains('#dirty', 'yes');
  });

  it('should display the correct dirty value with default value', async () => {
    await renderApp('http://localhost:3000/useFieldArray/default');
    const renderCountStart = getRenderCount();
    cy.expectContains('#dirty', 'no');
    await cy.focus('#field0');
    await cy.blur('#field0');
    cy.expectContains('#dirty', 'no');
    await cy.type('#field0', 'test');
    cy.expectContains('#dirty', 'yes');
    await cy.blur('#field0');
    cy.expectContains('#dirty', 'yes');
    await cy.focus('#field0');
    await cy.blur('#field0');
    cy.expectContains('#dirty', 'yes');
    await cy.clear('#field0');
    await cy.type('#field0', 'test');
    cy.expectContains('#dirty', 'no');
    await cy.click('#delete1');
    cy.expectContains('#dirty', 'yes');
    await cy.click('#append');
    await cy.clearAndType('#field0', 'test');
    await cy.clearAndType('#field1', 'test1');
    await cy.clearAndType('#field2', 'test2');
    cy.expectContains('#dirty', 'no');
  });

  it('should display the correct dirty value with async default value', async () => {
    await renderApp('http://localhost:3000/useFieldArray/asyncReset');
    const renderCountStart = getRenderCount();
    await cy.waitFor(() => cy.expectExist('#field0'));
    cy.expectContains('#dirty', 'no');
    await cy.focus('#field0');
    await cy.blur('#field0');
    cy.expectContains('#dirty', 'no');
    await cy.type('#field0', 'test');
    cy.expectContains('#dirty', 'yes');
    await cy.blur('#field0');
    cy.expectContains('#dirty', 'yes');
    await cy.focus('#field0');
    await cy.blur('#field0');
    cy.expectContains('#dirty', 'yes');
    await cy.clear('#field0');
    await cy.type('#field0', 'test');
    cy.expectContains('#dirty', 'no');
    await cy.click('#delete1');
    cy.expectContains('#dirty', 'yes');
    await cy.click('#append');
    await cy.clearAndType('#field0', 'test');
    await cy.clearAndType('#field1', 'test1');
    await cy.clearAndType('#field2', 'test2');
    cy.expectContains('#dirty', 'no');
  });

  it('should display correct error with the inputs', async () => {
    await renderApp('http://localhost:3000/useFieldArray/default');
    const renderCountStart = getRenderCount();
    await cy.click('#prepend');
    await cy.clear('#field1');
    await cy.clear('#field2');
    await cy.clear('#field3');
    await cy.click('#append');
    await cy.click('#submit');
    cy.expectContains('#error1', 'This is required');
    cy.expectContains('#error2', 'This is required');
    cy.expectContains('#error3', 'This is required');
    await cy.type('#field1', 'test');
    cy.expectNotExist('#error1');
    cy.expectContains('#error2', 'This is required');
    cy.expectContains('#error3', 'This is required');
    await cy.click('#move');
    cy.expectContains('#error0', 'This is required');
    cy.expectNotExist('#error2');
    await cy.click('#prepend');
    cy.expectNotExist('#error0');
    cy.expectContains('#error1', 'This is required');
  });

  it('should return correct touched values', async () => {
    await renderApp('http://localhost:3000/useFieldArray/default');
    const renderCountStart = getRenderCount();
    await cy.type('#field0', '1');
    await cy.type('#field1', '1');
    await cy.type('#field2', '1');
    cy.expectContains('#touched', '[{"name":true},{"name":true}]');
    await cy.click('#append');
    await cy.click('#prepend');
    cy.expectContains(
      '#touched',
      '[null,{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
    await cy.click('#insert');
    cy.expectContains(
      '#touched',
      '[{"name":true},null,{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
    await cy.click('#swap');
    cy.expectContains(
      '#touched',
      '[{"name":true},{"name":true},{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
    await cy.click('#move');
    cy.expectContains(
      '#touched',
      '[{"name":true},{"name":true},{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
    await cy.click('#insert');
    cy.expectContains(
      '#touched',
      '[{"name":true},null,{"name":true},{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
    await cy.click('#delete4');
    cy.expectContains(
      '#touched',
      '[{"name":true},{"name":true},{"name":true},{"name":true},{"name":true},{"name":true}]',
    );
  });

  it('should return correct touched values without autoFocus', async () => {
    await renderApp(
      'http://localhost:3000/useFieldArray/defaultAndWithoutFocus',
    );
    const renderCountStart = getRenderCount();
    await cy.type('#field0', '1');
    await cy.type('#field1', '1');
    await cy.type('#field2', '1');
    cy.expectContains('#touched', '[{"name":true},{"name":true}]');
    await cy.click('#append');
    await cy.click('#prepend');
    cy.expectContains(
      '#touched',
      '[null,{"name":true},{"name":true},{"name":true},null]',
    );
    await cy.click('#insert');
    cy.expectContains(
      '#touched',
      '[null,null,{"name":true},{"name":true},{"name":true},null]',
    );
    await cy.click('#swap');
    cy.expectContains(
      '#touched',
      '[null,{"name":true},null,{"name":true},{"name":true},null]',
    );
    await cy.click('#move');
    cy.expectContains(
      '#touched',
      '[null,null,{"name":true},{"name":true},{"name":true},null]',
    );
    await cy.click('#insert');
    cy.expectContains(
      '#touched',
      '[null,null,null,{"name":true},{"name":true},{"name":true},null]',
    );
    await cy.click('#delete4');
    cy.expectContains(
      '#touched',
      '[null,null,null,{"name":true},{"name":true},null]',
    );
  });

  it('should return correct isValid formState', async () => {
    await renderApp('http://localhost:3000/useFieldArray/formState');
    const renderCountStart = getRenderCount();
    await cy.waitFor(() => cy.expectContains('#isValid', 'yes'));
    await cy.click('#append');
    await cy.click('#append');
    await cy.click('#append');

    cy.expectContains('#isValid', 'yes');

    await cy.clear('#field0');

    cy.expectContains('#isValid', 'no');

    await cy.click('#delete0');
    await cy.type('#field1', '1');

    cy.expectContains('#isValid', 'yes');

    await cy.clear('#field0');

    cy.expectContains('#isValid', 'no');

    // introduced by react 19 with race condition with blur and useEffect action
    await cy.blur('#field0');
    await cy.wait(100);

    await cy.click('#delete0');
    await cy.wait(100);

    const emptyField = document.querySelector(
      'ul > li input[id^="field"]',
    ) as HTMLInputElement | null;

    if (emptyField && !emptyField.value) {
      await cy.type(`#${emptyField.id}`, '1');
    }

    await cy.waitFor(() => cy.expectContains('#isValid', 'yes'));

    await cy.click('#append');
    await cy.clear('#field0');

    cy.expectContains('#isValid', 'no');

    await cy.click('#delete0');

    await cy.waitFor(() => cy.expectContains('#isValid', 'yes'));

    await cy.click('#append');
    await cy.click('#append');

    await cy.clear('#field1');
    await cy.clear('#field2');

    cy.expectContains('#isValid', 'no');

    await cy.click('#delete1');
    await cy.click('#delete1');

    await cy.waitFor(() => cy.expectContains('#isValid', 'yes'));
  });
});
