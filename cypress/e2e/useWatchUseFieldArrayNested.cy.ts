describe('useWatchUseFieldArrayNested', () => {
  it('should watch the correct nested field array', () => {
    cy.visit('http://localhost:3000/useWatchUseFieldArrayNested');

    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal([
        {
          firstName: 'Bill',
          keyValue: [{ name: '1a' }, { name: '1c' }],
          lastName: 'Luo',
        },
      ]),
    );

    cy.get(`#nest-append-0`).click();
    cy.get(`#nest-prepend-0`).click();
    cy.get(`#nest-insert-0`).click();
    cy.get(`#nest-swap-0`).click();
    cy.get(`#nest-move-0`).click();

    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal([
        {
          firstName: 'Bill',
          keyValue: [
            { name: 'insert' },
            { name: 'prepend' },
            { name: '1a' },
            { name: '1c' },
            { name: 'append' },
          ],
          lastName: 'Luo',
        },
      ]),
    );

    cy.get(`#nest-remove-0`).click();

    cy.get('#submit').click();

    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal([
        {
          firstName: 'Bill',
          keyValue: [
            { name: 'insert' },
            { name: '1a' },
            { name: '1c' },
            { name: 'append' },
          ],
          lastName: 'Luo',
        },
      ]),
    );

    cy.get('#prepend').click();
    cy.get('#append').click();
    cy.get('#swap').click();
    cy.get('#insert').click();

    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal([
        { firstName: 'prepend', keyValue: [] },
        { firstName: 'insert', keyValue: [] },
        { firstName: 'append', keyValue: [] },
        {
          firstName: 'Bill',
          keyValue: [
            { name: 'insert' },
            { name: '1a' },
            { name: '1c' },
            { name: 'append' },
          ],
          lastName: 'Luo',
        },
      ]),
    );

    cy.get(`#nest-append-0`).click();
    cy.get(`#nest-prepend-0`).click();
    cy.get(`#nest-insert-0`).click();
    cy.get(`#nest-swap-0`).click();
    cy.get(`#nest-move-0`).click();

    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal([
        {
          firstName: 'prepend',
          keyValue: [
            { name: 'insert' },
            { name: 'prepend' },
            { name: 'append' },
          ],
        },
        { firstName: 'insert', keyValue: [] },
        { firstName: 'append', keyValue: [] },
        {
          firstName: 'Bill',
          lastName: 'Luo',
          keyValue: [
            { name: 'insert' },
            { name: '1a' },
            { name: '1c' },
            { name: 'append' },
          ],
        },
      ]),
    );

    cy.get('#nest-update-3').click();

    cy.get('input[name="test.3.keyValue.2.name"]').should(
      'have.value',
      'update',
    );

    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal([
        {
          firstName: 'prepend',
          keyValue: [
            { name: 'insert' },
            { name: 'prepend' },
            { name: 'append' },
          ],
        },
        { firstName: 'insert', keyValue: [] },
        { firstName: 'append', keyValue: [] },
        {
          firstName: 'Bill',
          keyValue: [
            { name: 'insert' },
            { name: '1a' },
            { name: 'update' },
            { name: 'append' },
          ],
          lastName: 'Luo',
        },
      ]),
    );

    cy.get('#nest-update-0').click();

    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal([
        {
          firstName: 'prepend',
          keyValue: [
            { name: 'insert' },
            { name: 'prepend' },
            { name: 'update' },
          ],
        },
        { firstName: 'insert', keyValue: [] },
        { firstName: 'append', keyValue: [] },
        {
          firstName: 'Bill',
          lastName: 'Luo',
          keyValue: [
            { name: 'insert' },
            { name: '1a' },
            { name: 'update' },
            { name: 'append' },
          ],
        },
      ]),
    );

    cy.get('#nest-remove-3').click();
    cy.get('#nest-remove-3').click();

    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal([
        {
          firstName: 'prepend',
          keyValue: [
            { name: 'insert' },
            { name: 'prepend' },
            { name: 'update' },
          ],
        },
        { firstName: 'insert', keyValue: [] },
        { firstName: 'append', keyValue: [] },
        {
          firstName: 'Bill',
          lastName: 'Luo',
          keyValue: [{ name: 'insert' }, { name: 'append' }],
        },
      ]),
    );

    cy.get('#nest-remove-all-3').click();
    cy.get('#nest-remove-all-2').click();
    cy.get('#nest-remove-all-1').click();
    cy.get('#nest-remove-all-0').click();

    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal([
        { firstName: 'prepend', keyValue: [] },
        { firstName: 'insert', keyValue: [] },
        { firstName: 'append', keyValue: [] },
        { firstName: 'Bill', lastName: 'Luo', keyValue: [] },
      ]),
    );

    cy.get('#remove').click();
    cy.get('#remove').click();
    cy.get('#remove').click();

    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal([
        { firstName: 'prepend', keyValue: [] },
      ]),
    );

    cy.get('#count').contains('9');
  });
});
